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

In case you want to generate the static pages locally (could be useful for large changes) follow these steps:

1. Clone the CESNET/du-docs repo `git clone https://github.com/CESNET/du-docs.git`.
2. Enter the directory `cd du-docs`.
3. *(Optional)* Checkout to specific branch `git checkout branch_to_test`.
4. Run the build (change the fumadocs version number if needed; version 16.11.1 was installed on July 15, 2016):
```bash
docker run -it --rm -p 3000:3000 -e STARTPAGE=/en/docs/introduction/introduction -v ./public:/opt/fumadocs/public -v ./content/docs:/opt/fumadocs/content/docs cerit.io/docs/fuma:v16.11.1
```
5. Open another terminal and change to *du-docs* `cd du-docs`. Find the container name (`docker container ls`), then copy local files in *app* and *components* directories over the container directories (replace *\<container_name\>* with the actual name of the container):
```bash
for dir in app components; do docker cp $dir <container_name>:/opt/fumadocs; done
```
6. Documentation will be available at [http://localhost:3000/en/docs/introduction/introduction](http://localhost:3000/en/docs/introduction/introduction); it is automatically rebuilt on source change.
