# privatize

`privatize` facilitates the installation of private packages from private repositories like GitHub using SSH keys. This package reads package details from `privatize.json` and sets up the environment for installation. It is very useful when deploying private packages to build environments like cloudflare, where the SSH details can be stored as an environment variable available at build time. It also works quite well when developing within virtual machine environments like docker.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)

## Installation

Run the following command in your terminal:

```bash
npm install https://github.com/ycore/privatize
```

## Usage

To use `privatize`, make sure you have a `privatize.json` file located in the root of your application directory. This file should contain the private repository packages to install. Here’s an example of how to structure the file:

```json
{
  "packages": [
    "https://github.com/user/package-1",
    "https://github.com/user/package-2",
    "https://github.com/user/package-3"
  ]
}
```

### Preparing keys

```bash
ssh-keygen -t ed25519 -C "user@example.com" # your github user access e-mail adress
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Paste the public key information to the repository profile. In Github, go to `Profile` - `Settings` - `SSH & GPG keys` to add a new ssh key.

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy the base64-encoded private key to store in the `DEPLOYMENT_KEY` environment variable on the docker virtual development machine or cloudflare dashboard.

```bash
cat ~/.ssh/id_ed25519 | base64
```

### Running privatize

After setting up `privatize.json`, you can include `privatize` as a `preinstall` script in the scripts section pf `package.json`.

```json
  "scripts": {
    "preinstall": "privatize",
  }
```

Make sure you have your SSH private key set in the `DEPLOYMENT_KEY` environment variable.

## Configuration

### Environment Variables

- **DEPLOYMENT_KEY**: This environment variable should contain the base64-encoded private SSH key used for authentication with the private repositories like GitHub. You can set it in your terminal like this:

```bash
cat ~/.ssh/id_ed25519 | base64
export DEPLOYMENT_KEY="base64_encoded_private_key"
```

### Cloudflare dashboard

- **DEPLOYMENT_KEY**: Setup the environment variable in the cloudflare dashboard. It should contain the base64-encoded private SSH key used for authentication with the private repository.

## How it works

privatize writes the base64-decoded private key to `~/.ssh/id_ed25519` and the runs a `npm install --no-scripts --save-optional` command for all nominated packages.

The install is then validated against the public key on the private repository profile. This allows you to install packages from private repositories, while storing private key information secure in secret environment variables. Since the package is installed as an optional package, it will not stop the installation on the first pass of subsequent `npm install`s, running again once the `preinstall` is executed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. We welcome contributions and suggestions!

## Support

For any issues or questions, please open an issue in the GitHub repository.
