// ALG Voice Lab adapter for LiteRT-LM d17a52fd5c2b4ce1280959309af175caebaac2c3.
// Arguments: MODEL_FOLDER_OR_LITERTLM INPUT_TSV OUTPUT_DIRECTORY
#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <string>
#include <variant>
#include "omni/base/io_types.h"
#include "omni/tts/tts_engine.h"
#include "omni/tts/tts_session.h"

using Clock = std::chrono::steady_clock;
double Millis(Clock::time_point t) {
  return std::chrono::duration<double, std::milli>(Clock::now() - t).count();
}
void LE(std::ofstream& out, uint32_t value, int bytes) {
  for (int i = 0; i < bytes; ++i) out.put(static_cast<char>(value >> (i * 8)));
}
bool WriteWav(const std::filesystem::path& path, const litert::omni::AudioOutput& a) {
  if (a.pcm_samples.empty() || a.sample_rate_hz <= 0) return false;
  std::ofstream f(path, std::ios::binary);
  uint32_t size = a.pcm_samples.size() * 2;
  f.write("RIFF", 4); LE(f, size + 36, 4); f.write("WAVEfmt ", 8);
  LE(f, 16, 4); LE(f, 1, 2); LE(f, 1, 2); LE(f, a.sample_rate_hz, 4);
  LE(f, a.sample_rate_hz * 2, 4); LE(f, 2, 2); LE(f, 16, 2);
  f.write("data", 4); LE(f, size, 4);
  for (float x : a.pcm_samples) {
    if (!std::isfinite(x)) return false;
    LE(f, static_cast<uint16_t>(static_cast<int16_t>(std::clamp(x, -1.f, 1.f) * 32767)), 2);
  }
  return f.good();
}
int main(int argc, char** argv) {
  if (argc != 4) { std::cerr << "Usage: voice_lab MODEL INPUT_TSV OUTPUT_DIR\n"; return 2; }
  std::ifstream input(argv[2]);
  if (!input) { std::cerr << "Cannot open input\n"; return 2; }
  const std::filesystem::path out(argv[3]);
  std::filesystem::create_directories(out);
  auto begin = Clock::now();
  litert::omni::tts::TtsEngineSettings settings;
  settings.model_folder = argv[1];
  settings.cache_dir = (out / "cache").string();
  settings.num_threads = 4;
  settings.model_config = litert::omni::tts::KokoroModelConfig{};
  auto engine = litert::omni::tts::TtsEngine::Create(settings);
  if (!engine.ok()) { std::cerr << engine.status() << '\n'; return 1; }
  const double load = Millis(begin);
  double generation = 0;
  int index = 0;
  std::string line;
  while (std::getline(input, line)) {
    auto tab = line.find('\t');
    if (tab == std::string::npos || tab == 0 || tab + 1 == line.size()) return 2;
    begin = Clock::now();
    litert::omni::tts::TtsSessionConfig config;
    config.language = "en-US";
    config.voice = line.substr(0, tab);
    auto session = (*engine)->CreateSession(config);
    if (!session.ok()) { std::cerr << session.status() << '\n'; return 1; }
    auto pushed = (*session)->text_source().PushText(line.substr(tab + 1));
    if (!pushed.ok()) { std::cerr << pushed << '\n'; return 1; }
    (*session)->text_source().Finish();
    auto result = (*session)->ProcessNext();
    if (!result.ok()) { std::cerr << result.status() << '\n'; return 1; }
    generation += Millis(begin);
    auto* audio = std::get_if<litert::omni::AudioOutput>(&*result);
    if (!audio || !WriteWav(out / (std::to_string(index++) + ".wav"), *audio)) {
      std::cerr << "No valid audio returned\n"; return 1;
    }
  }
  if (!index) return 2;
  std::ofstream timing(out / "timing.json");
  timing << "{\"load_ms\":" << load << ",\"generation_ms\":" << generation << "}\n";
  return timing.good() ? 0 : 1;
}
