# FitnessProject

## tiF Mobile App: Health and Fitness

- Our new mobile app is an application designed to make socializing be much more accessible for individuals just getting into fitness, or to give a simplistic, but reliable way to schedule events for themselves and groups. We plan on having the app be available as a tool used to build communities and strengthen bonds with others in the pursuit of getting healthier, in order to take advantage of the rising digital age, instead of ignoring it.

- We hope to expand into further prospects as we develop our application, and begin turning fitness around!

## Installation

In order to install the project, you must first:

1. Create an email account and a [GitHub](https://github.com/signup) account to access the repo:

2. Clone the remote repository to your local machine using a git client or through the command line.

   #### Git Client

   After installing, click the “clone from URL” button and add the repo’s git: <https://github.com/tifapp/FitnessProject.git>

   #### Command Line

   If you are instead using the command line, install git and then run this command:

   git clone <https://github.com/tifapp/FitnessProject.git>

3. Install [Node.js](https://nodejs.org/download/release/v16.13.1/) version 16.13.1:

   #### Windows

   Look for the package labeled "node-v16.13.1-win…", and download.

   #### Mac

   Look for the package labeled "node-v16.13.1-pkg", and download.

4. Install the Expo CLI in the command line, using this command: npm install expo-cli --global

5. Go to the FitnessProject folder (cd FitnessProject), then install all dependencies through the command line (npm install).

## Usage

Using the app is fairly simple:

### Running the Server

To use the app, you must first run the metro server on your machine through the command line:

#### Local Process

1.  expo start

    - Note: You must be on the same wifi network, in order to make proper usage of the server.

#### Publicly Accessible Proces

2.  expo start –tunnel

    - Note: This opens a tunnel link that is accessible to anyone from the internet.

Second, download the Expo Go App on the Play Store/App Store, to test the application locally.

1.  To use the app, you must scan the given QR code or link from the terminal using the Expo Go app.

## Manually Testing the App

- Use “expo start”/“expo start --tunnel”

- Scan the QR code on your testing device or open the tunnel URL by clicking on the link

- Create a new user, or use the test account to enter sandbox mode

  - [cse115bdevelopers@gmail.com](mailto:cse115bdevelopers@gmail.com)
  - cse115bdeveloper

## Running Automated Testing

We utilize automated testing in a good portion of our work. In order to run tests that have been created, you must:

## Convention

## Development process

To develop for the app, you must utilize a code editor of your own choosing. Recommendations are given below, for the usage of [Visual Studio Code](https://visualstudio.microsoft.com/downloads/).

### Recommended Settings for VSCode

Settings here are to be added onto your workspace's settings.json.

      ```{
      "diffEditor.renderSideBySide":false,
      "\[javascript]": {
      "editor.defaultFormatter":"esbenp.prettier-vscode",
      "editor.formatOnSave":true,
      "editor.formatOnPaste":true,
      "editor.autoIndent":"full",
      },
      "editor.codeActionsOnSave": {"source.fixAll":true,"source.fixAll.eslint":true,"source.organizeImports":true,"source.addMissingImports":true,},
      "javascript.updateImportsOnFileMove.enabled":"always",
      "\[json]": {
      "editor.defaultFormatter":"esbenp.prettier-vscode"
      }
      }```

If you are a developer for the app, please keep track of tasks on our Trello: [Fitness Project (fitnessproject19) | Trello](https://trello.com/w/fitnessproject19)

### Recommended Extensions for VSCode

- Prettier ESLint
- Code spell checker
- GraphQL: Inline Operation Execution
- GraphQL: Language Feature Support
- GraphQL: Syntax Highlighting

## Branch Management / Pull Request Policy

- Branch off the development branch for each task you are performing.

- When you are ready to merge your feature branch to the sprint branch, create a pull request and have it reviewed by one other team member.

  - Recommended to checkout the branch and test the changes locally before approval

- Before the pull request, do a git rebase squash.

- Once merged, delete the branch afterward.

### React Native

- Documentation:<https://reactnative.dev/>

- Tutorial:<https://reactnative.dev/docs/getting-started>

### Appendix

<https://www.linode.com/docs/guides/install-and-use-npm-on-linux/>

<https://docs.expo.dev/workflow/expo-cli/>

[Setting up the development environment · React Native](https://reactnative.dev/docs/environment-setup)

<https://reactnative.dev/docs/getting-started>

### Storybook

1. cd .storybook

2. npm install

3. expo start

4. When adding new stories, run "npm run update-stories" so they appear in the app

See examples in .storybook/components
