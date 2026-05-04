# TODO

## GPT dialog

- [ ] Allow use Enter key to send a question
- [ ] Handle all errors. E.g., missing API key causes qa API to be unresponsive
- [X] Make all hrefs clickable, i.e., convert https:// texts to links
- [ ] Return sign in redirect to active GPT modal window
- [X] Show links to chapters with answer
- [ ] Allow sequential questions

## Engine

- [X] Secure API endpoint `/buildPrompt` by user session
- [X] Secure API endpoint `/qa` by user session

## How to compile on a local station

In case you want to generate the static pages locally (could be useful for large changes) see below.

1. Clone the CESNET/du-docs repo `git clone https://github.com/CESNET/du-docs.git`
2. Clone CERIT-SC/fumadocs repo with some objects common to all eInfra docs: `git clone https://github.com/CERIT-SC/fumadocs`
3. Copy the required files `cp -r fumadocs/components/* du-docs/components/`
4. Enter the directory `cd du-docs`
5. (Optional) Checkout to specific branch `git checkout branch_to_test`
6. Run the build
```bash
docker run -it --rm -p 3000:3000 -e STARTPAGE=/en/docs -v ./public:/opt/fumadocs/public -v ./components:/opt/fumadocs/components -v ./content/docs:/opt/fumadocs/content/docs cerit.io/docs/fuma:v16.4.6 pnpm dev
```
7. Documentation will be available at [http://localhost:3000/en/docs/introduction/introduction](http://localhost:3000/en/docs/introduction/introduction) and automatically rebuilt on source change.
