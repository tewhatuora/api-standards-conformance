<a name="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/tewhatuora/api-standards-conformance">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/two-dark-theme-logo.svg">
      <img alt="Health New Zealand Te Whatu Ora Logo" src="./assets/two.svg" width="50%">
    </picture>
  </a>

  <h3 align="center">Health New Zealand | Te Whatu Ora API Conformance Tool</h3>

  <p align="center">
    This project is a conformance tool framework designed to assess an API against the Te Whatu Ora API Standards which are officially published at <a href="https://apistandards.digital.health.nz">https://apistandards.digital.health.nz</a>.
    <br />
</div>

<!-- GETTING STARTED -->

## Getting Started

## Running the tool as a Docker container

Pull the latest image:

`docker pull ghcr.io/tewhatuora/api-standards-conformance:latest`

Run a conformance test (note you must have a valid config.json in the current working directory):

`docker run -it -v $(pwd)/config.json:/usr/src/app/config.json -v $(pwd)/reports:/usr/src/app/reports ghcr.io/tewhatuora/api-standards-conformance`

To merge custom features with the base implementation, mount to `/opt/features`

`docker run -v$(pwd)/override:/opt/features -v $(pwd)/config.json:/usr/src/app/config.json -v $(pwd)/reports:/usr/src/app/reports ghcr.io/tewhatuora/api-standards-conformance`

To execute specific specific tags

`docker run -v$(pwd)/override:/opt/features -v $(pwd)/config.json:/usr/src/app/config.json -v $(pwd)/reports:/usr/src/app/reports ghcr.io/tewhatuora/api-standards-conformance --tags @fhir`

To skip specific specific tags

`docker run -v$(pwd)/override:/opt/features -v $(pwd)/config.json:/usr/src/app/config.json -v $(pwd)/reports:/usr/src/app/reports ghcr.io/tewhatuora/api-standards-conformance --tags '"not @not-implemented"'`

## Development

This tool is distributed as a Docker container, or you can build it yourself.

Install dependencies:

`yarn`

Run the tool without Docker:

`yarn test`
`yarn report`

Build the container locally:

`yarn build`

Run the container locally (test):

`yarn test:docker`

Run the container locally (report):

`yarn test:report`

## Configuration

Configuration for the tool is via a `config.json` file. When running in Docker, this file on the host should be mounted to `/usr/src/app/config.json` (see below). When running locally, the config.json must be present at the root of the project.

This configuration must be carefully reviewed prior to running the conformance tool.

Example report:

![Example report](./assets/report.png "Example report")

## License

This work is licensed under [CC BY-NC-ND 4.0](cc-by-nc-nd). Refer to the [LICENSE](./LICENSE) file for information.

[![CC BY 4.0][cc-by-nc-nd-image]](cc-by-nc-nd)

[cc-by-nc-nd]: https://creativecommons.org/licenses/by-nc-nd/4.0/
[cc-by-nc-nd-image]: https://i.creativecommons.org/l/by-nc-nd/4.0/80x15.png
