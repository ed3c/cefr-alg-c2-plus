# 無 API key 的英文情境學習整合方案

查核日期：2026-10-03。這是可分階段實作的架構決策，不是所有模組已完成，也不是模型排行榜。模型表現須以實際裝置、口音與教材驗證。

## 本次已實作

正式網站沿用 medium-compiler 的 Vercel Git 整合。ALG／English Studio 朗讀改為兩個選項：Parler TTS 預製課程音檔（預設）與 Kokoro browser WASM q8 裝置生成。提供 24 個 Parler 版本，對應 4 個情境 × 3 場 × 2 種英文版本；從當前 scene 播到 scenario 結束。原有 Web Speech 朗讀已移除。

第一次必須點 Play；不承諾鎖屏或背景連播。切換模型、場景、模式或版本會停止舊播放。語速直接作用於音訊播放。Parler 僅下載已生成音檔；Kokoro 首次下載公開模型後在裝置運算，不需推論 API key。瀏覽器若要求生成後再次點 Play，會直接播放已快取結果，不重算。

錄音與草稿目前留在分頁記憶體，使用者可下載。尚未做持久化、STT、LLM 或離線 PWA。頁面仍載入 Google Fonts，因此「無 API key」不等於「首次使用完全無網路」。

## 建議整合順序

| 階段 | 組件 | 設計與價值 | 狀態 |
| --- | --- | --- | --- |
| 1 | Vercel 靜態網站 | 沿用 medium-compiler 部署；情境內連播 | 已整合 |
| 2 | Parler TTS 預製音檔 | 全部課程預製、Laura／Jon、固定模型 revision 與文字／音檔校驗碼 | 已整合；不等於逐句語音品質已認證 |
| 3 | Kokoro.js + Transformers.js | 主動選擇後下載模型、Web Worker WASM q8 生成；可取消；不支援時可手動改選 Parler | 已整合；手機背景限制仍依瀏覽器 |
| 4 | Whisper + Transformers.js | 使用者完成錄音、主動按轉錄後在本機辨識；可編輯誤辨文字；不把辨識準確度當發音分數 | 待整合 |
| 5 | WebLLM | WebGPU 本機模型給出改寫與追問；固定情境事實與 style contract 隨提示輸入 | 待整合 |
| 6 | PWA + IndexedDB | 使用者選擇下載課程包與保留作品；版本化快取、儲存用量、刪除與匯出 | 待整合 |

Kokoro 在此是可行的開放模型候選，不宣稱是當前所有 TTS 中品質最高。固定情境優先預製音檔，讓手機不用先下載模型就能聽到一致的模型聲音。動態 TTS 才承擔下載與推論延遲。

## 資料與執行邊界

- Pages 提供 HTML、程式、固定教材與已生成音檔。使用者無須供應 OpenAI、Google、Hugging Face 或其他推論 API key。
- 模型採公開、無登入限制且授權合適的權重；固定 revision、runtime 版本與檔案摘要。下載模型是取得靜態檔案，不是呼叫雲端推論。部署前確認模型及每個聲音的授權條款。
- 下載前顯示實際資產大小、用途、儲存空間及取消按鈕。模型未下載完成時維持基本教材可用。快取可能被瀏覽器清理，不能保證永久離線。
- 不同模型共用載入佇列，避免同時載入 TTS、Whisper、LLM 導致手機記憶體耗盡。使用 Worker 維持介面可操作；遇到 GPU/device lost 提供清楚降級狀態。
- `navigator.gpu` 存在不代表模型一定可跑；檢查 adapter、limits、載入結果與小段推論。WASM 回退也須測試記憶體與速度，不能只改一個參數就宣稱支援所有裝置。
- 不預設 GitHub Pages 提供模型示範所需的 cross-origin isolation headers。先驗證 WebGPU／單執行緒 WASM 組態；多執行緒若需要 `SharedArrayBuffer`，須另外設計和驗證部署條件。不要無審查加第三方 isolation service worker。
- 原生 `SpeechRecognition.processLocally` 可作實驗選項，但屬實驗功能。檢查支援與語言包；不可默默退回遠端辨識。Whisper 本機轉錄是另一條明確的執行路徑。

## 將 medium-compiler / Soodles 風格落到模型契約

維持目前來源文件中的 actor、condition、evidence、uncertainty、next action 五項。LLM 輸入包含 scenario facts、使用者草稿和版本化 style contract；输出含：原文片段、可能問題、對應情境事實、保留語意的候選改寫及不確定處。

寫作要求：新讀者能理解的情境 → 限制與決策 → 結果與下一步。口語允許縮寫、短句、自然停頓與追問，仍須保留條件與不確定性。不要為了「像 C2」加入罕用詞。

模型不能把自己的建議標成已驗證、不能代替使用者完成自評、不能給出 CEFR 證書或把 ASR 成功率當成口說級別。保留原稿與候選改寫，讓使用者選擇。任何新增記錄功能應清楚說明保存位置及刪除方式。

## GitHub Pages 發布

`.github/workflows/pages.yml` 在 main 更新時先跑檢查，再上傳 `dist/`，最後部署。所有資產使用相對路徑，適用 repository project path。

GitHub 的自動 `GITHUB_TOKEN`／OIDC 只在 Actions 內提供部署權限，不會進入網頁，也不用使用者建立 API key 或 PAT。初次啟用 Pages 仍需 repository 管理設定，普通 workflow token 無法取代。到 repository Settings → Pages → Build and deployment → Source 選 GitHub Actions；之後在 Actions 執行或重跑此 workflow。

只有 Actions 部署成功並核對公開內容後，才能宣稱網站已上線。預期網址不是成功部署的證據。

## 驗收條件

1. 用實際桌面與手機瀏覽器測試從第二場連播至第三場；Stop、切換情境、切換語速與舊 callback 都不重啟舊對話。
2. 音檔載入失敗、權限拒絕、模型下載中斷、離線、快取被清理與 GPU 不支援皆有可用退路。
3. 對固定語意樣本檢查改寫是否保留否定、條件、責任與證據範圍；模型輸出仍明確標成建議。
4. 透過網路面板驗證本機模型推論時沒有上傳錄音或草稿；預載完成後才做離線驗收。
5. 首音延遲、完整合成耗時、模型下載大小、裝置記憶體與 ASR 錯誤分別量測，不以「最新模型」代替產品證據。

## 官方技術來源

- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [configure-pages enablement/token requirements](https://github.com/actions/configure-pages/blob/main/action.yml)
- [Speech synthesis localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService)
- [Browser autoplay policies](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
- [Kokoro official repository](https://github.com/hexgrad/kokoro) and [browser demo](https://github.com/hexgrad/kokoro/blob/main/kokoro.js/demo/README.md)
- [Transformers.js WebGPU / Whisper](https://huggingface.co/docs/transformers.js/guides/webgpu)
- [WebLLM](https://webllm.mlc.ai/)
- [Experimental local SpeechRecognition](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/processLocally)
