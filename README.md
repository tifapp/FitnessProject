# FitnessProject

Installing and testing the app ->

1. Create an email account and a GitHub account to access the repo

   1. <https://github.com/signup>

2. Clone the remote repository to your local machine using a git client or through the command line.

   1. We recommend using a git client like Sourcetree for convenience ([Install Sourcetree](https://confluence.atlassian.com/get-started-with-sourcetree/install-sourcetree-847359094.html)).

      1. After installing, click the “clone from URL” button and add the repo’s git<https://github.com/tifapp/FitnessProject.git>

   2. If you are instead using the command line, install git and then run this command:

      1. git clone<https://github.com/tifapp/FitnessProject.git>

3. Install Node.js version 16.13.1


1. <https://nodejs.org/download/release/v16.13.1/>

   1. For Windows, download node-v16.13.1-win…
   2. For Mac, download node-v16.13.1-pkg


4. Install the Expo CLI in the command line


1. npm install expo-cli --global


5. Go to the project folder, then install all dependencies through the command line

   1. cd FitnessProject
   2. npm install

6. Run the metro server on your machine through the command line

   1. expo start

      1. \*Must be on the same wifi network

   2. expo start –tunnel

      1. Opens a tunnel link that’s accessible to anyone from the internet

7. Download the Expo Go App on your device to test the application locally

   1. Scan the given QR code or link from the terminal  


Development process ->

8. [Code Editor (IDE) - Visual Studio](https://visualstudio.microsoft.com/downloads/)

   1. Settings
   {
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
   }

  


9. Create an AWS account and follow the instructions in the link<https://docs.amplify.aws/>

10. In the project folder use the command "amplify configure" and select the region "us-west-2" for AWS setup.

    1. See Sean for login details

Trello:[Fitness Project (fitnessproject19) | Trello](https://trello.com/w/fitnessproject19)

Login instructions:  
  
<https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_sign-in.html>

<https://docs.aws.amazon.com/IAM/latest/UserGuide/console.html#user-sign-in-page>

  


Tif Mobile App ->

Convention ->

Branch Management ->

- Branch off the development branch for each user story.

- When you are ready to merge your feature branch to the sprint branch, create a pull request and have it reviewed by two other team members and one code owner (Sean or Surya).

  - Recommended to checkout the branch and test the changes locally before approval

- Before the pull request, do a git rebase squash.

- Once merged, delete the branch afterward.

Debugging ->

- Reproduce the error
- Isolate the error
- Feel free to reach out to team members through Slack for any issues.

Testing ->

- Use “expo start”/“expo start --tunnel”

- Scan the QR code on your testing device or open the tunnel URL by clicking on the link

- Create a new user, or use the test account to enter sandbox mode

  - [cse115bdevelopers@gmail.com](mailto:cse115bdevelopers@gmail.com)
  - cse115bdeveloper

Pull Requests ->

- When you have a feature ready to be merged into the sprint branch, issue a pull request
- Two other members on the team and one code owner must approve the changes before the merge
- When a pull request gets made, jenkins will test it for any compile time errors

Extensions (Visual Studio Code) ->

- Prettier ESLint
- Code spell checker
- GraphQL: Inline Operation Execution
- GraphQL: Language Feature Support
- GraphQL: Syntax Highlighting

Sourcetree ->

- Download using the following link<https://www.sourcetreeapp.com/>
- Tutorial<https://confluence.atlassian.com/get-started-with-sourcetree>

React Native ->

- Documentation:<https://reactnative.dev/>


- Tutorial:<https://reactnative.dev/docs/getting-started>

Appendix ->

<https://www.linode.com/docs/guides/install-and-use-npm-on-linux/>

<https://docs.expo.dev/workflow/expo-cli/>

[Setting up the development environment · React Native](https://reactnative.dev/docs/environment-setup)

<https://reactnative.dev/docs/getting-started>

To do:

- Include AWS setup
- Include details on setting up and using Sourcetree
- Include visual studio settings and extensions, and tips/helpful shortcuts
- Include react native documentation links

### Storybook

1. cd .storybook

2. npm install

3. expo start

4. When adding new stories, run "npm run update-stories" so they appear in the app

See examples in .storybook/components
