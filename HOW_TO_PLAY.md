# Shadowdark // Solo Engine — How to Play

A ten-step guide for someone who would rather play the game than learn web development. Sensible.

1. **Open the app.** Download `index.html` and double-click it. It opens in a modern browser. There is no installer, build step, npm package, or server required. If you are using Replit, create a plain HTML project, upload this file as `index.html`, and open the Preview pane.

2. **Start with the sample campaign.** The app opens with *The Bell Under Sablewood*, Rook (fighter), Lysa (thief), and a goblin encounter already loaded. Rook is the player character; Lysa is the first companion. You can rename the campaign in the top bar.

3. **Get an OpenAI API key.** Sign in at [platform.openai.com](https://platform.openai.com/), open [API keys](https://platform.openai.com/api-keys), and create a new secret key. Copy it when it appears. You generally cannot reveal the full key again later.

4. **Make sure API billing is enabled.** API usage is billed separately from a ChatGPT subscription. Add a payment method or credits in the OpenAI platform billing area and set a usage limit there if you want a hard spending ceiling.

5. **Open Settings.** Click **Settings** in the top bar. The defaults are:
   - API base URL: `https://api.openai.com/v1`
   - Model: `gpt-4o-mini`
   - Temperature: `0.7`
   - API key: blank until you paste yours

   Paste your key into **API key**, leave the base URL and model as shown, then click **Save Settings**. Settings are saved in this browser's `localStorage`.

6. **Or connect a local Ollama server.** Set the API base URL to `http://localhost:11434/v1`, enter the model name exactly as Ollama reports it, and leave the API key blank unless your local proxy requires one. Ollama must be running and configured to accept browser-origin requests. The app uses the OpenAI-compatible `/chat/completions` endpoint.

7. **Take a turn.** Type what the character intends to do in the box below the narrative log, then press **Send**. Be concrete: “Rook examines the iron hatch for a hidden latch” is more useful than “What happens?” The DM frames the situation, asks the kernel for any required checks, and narrates the results. Dice, damage, timers, inventory, and XP are calculated by the local engine, not by the model.

8. **Watch the state.** The left column tracks HP, light, gear slots, XP, conditions, and initiative. The right column has the character sheet, Journal, and Companions tabs. Click **Ask companion to act** on a companion's turn. **Recruit companion** adds another party member; the party supports one player character and up to three companions.

9. **Save or move your campaign.** **Save** writes the current campaign to this browser. **Load** restores that saved campaign. **Export** downloads a JSON backup. **Import** accepts a JSON export pasted into the import panel. Keep backups somewhere sensible; `localStorage` is not a backup strategy, despite humanity's continued attempts to make it one.

10. **Run the Self-Test.** Click **Run Self-Test**. It executes the fixed-dice ten-turn smoke test, the §8 checklist assertions, the 30-turn background stress checks, and the engine-reliability regression checks without making API calls. Results appear in the Debug panel. A healthy build reports **0 FAIL**. The current pass count is shown in the Debug panel because the suite grows as regression checks are added.

## Approximate API cost

The app makes two model requests per turn. At the currently published GPT-4o mini rates of **$0.15 per million input tokens** and **$0.60 per million output tokens**, a rough 40-turn session is about **$0.09** if it averages roughly 480,000 input tokens and 24,000 output tokens. Four such sessions in a month would be about **$0.36**, so budget roughly **$0.40/month**. Longer journal entries, longer responses, retries, or a larger model increase that figure. Actual billing is token-based, not a flat session fee. See the [GPT-4o mini model page and pricing](https://developers.openai.com/api/docs/models/gpt-4o-mini).

**Model availability note:** OpenAI currently marks `gpt-4o-mini` as deprecated. It remains the requested default in this app, but it may eventually stop being available. If that happens, change the model name in Settings to a model your API account supports.

**Key safety:** the API key is stored in browser `localStorage` and sent directly from the browser to the API provider. Do not use this app on a shared computer or publish a live copy with your key already entered. The exported campaign JSON does not include the API key.
