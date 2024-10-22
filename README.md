# privatize.js

privatize.js is a Node.js package designed to facilitate the installation of private packages from GitHub using SSH keys. This package reads configuration from a `privatize.json` file and sets up the necessary environment for installation.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)

## Installation

To install `privatize.js`, you can use npm. Run the following command in your terminal:

```bash
npm install git+https:github.com//ycore/privatize
```

## Usage

To use `privatize`, you need to create a `privatize.json` file in your application root directory. This file should contain the packages you want to install. Here’s an example of how to structure the file:

```json
{
  "packages": ["your-private-package-1", "your-private-package-2"]
}
```

### Running privatize.js

After setting up your `privatize.json`, you can run the `privatize.js` script. Make sure you have your SSH keys set up and the `DEPLOYMENT_KEY` environment variable configured.

You can run the script using Node.js:

```bash
node node_modules/privatize/index.js
```

## Configuration

### Environment Variables

- **DEPLOYMENT_KEY**: This environment variable should contain the base64-encoded private SSH key used for authentication with GitHub. You can set it in your terminal like this:

```bash
export DEPLOYMENT_KEY="base64_encoded_private_key"
```

### privatize.json

Make sure your `privatize.json` file is located in the root of your application directory and contains the necessary package names.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request. We welcome contributions and suggestions!

## Support

For any issues or questions, please open an issue in the GitHub repository.
