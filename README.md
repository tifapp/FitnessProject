# FitnessProject

React Native Frontend Repo for tiF.

## Getting Started

### Xcode and Android Studio

We use expo's bare workflow to manage our app. This means that we have full control over the native Xcode and Android Studio projects, but we use EAS build and the expo-cli to aid us in development.

First, ensure that you have either a recent version of Xcode or Android Studio installed. You will need either one of these tools to compile the iOS and Android apps respectively. Xcode is only available on macOS, so you will need a mac to compile the iOS app.

You can find latest releases of Xcode [here](https://xcodereleases.com/) (Do not install it through the mac app store).

You can find latest releases of Android Studio [here](https://developer.android.com/studio/releases).

Everytime new native code is added, either through native code we write, or from another library, you will need to rebuild the app in both tools.

### `.env` Files

We have 2 `.env` files that we use in this repo, `.env` and `.env.infra`. The first contains a few public API keys (such as the Sentry DSN and Mixpanel Token) and base URLs for APIs we use in production. The second file contains secrets needed by infrastructure related tooling, such as EAS post-install scripts, and are not bundled in the production app.

### Setup + Running

After cloning the repo, make sure to run the typical `npm install`. Then afterwards, there are various scripts you can run for development. Here are the main ones you'll need to know about in order of relevance:
1. `npm run start` to start the dev server (you will need to compile the app with Android Studio or Xcode before running this).
2. `npm run sb_start` to start the dev server for runing the storybook version of the app (you will need to compile the app with Android Studio or Xcode before running this).
3. `npm run test` to run the unit tests.
4. `npm run test-acceptance` to run the acceptance (or e2e) tests.
5. `npm run eas_dev_build` to create an EAS dev build on expo's servers.
6. `npm run eas_dev_build_local` to create a local EAS dev build (you must have Xcode or Android Studio installed for this to work).

### Contributing

For now we have a typical checkout branch, make changes, open PR flow. However, we'll often review PRs during our regular meetings.

When opening a PR, try to explain the changes you've made and **why** you're making them. PR descriptions serve as a crucial reference point of documentation, so don't skimp on this part.

Each PR will also need to have one or more trello tickets linked to it. You can link a ticket by putting the URL to the ticket at the bottom of the PR. If your PR does not cover an explicit ticket (eg. in the moment fix, or the ticket hasn't been created for some reason), you can put `TASK_UNTRACKED` at the bottom of the PR. However, only do this sparingly.

## Development Guidelines

Since this is a react application, you'll want to get familiar with our conventions of using react since it is unopinionated. Luckily, the general architecture is documented [here](https://github.com/tifapp/TiFShared/wiki/Frontend-Architecture).

Try not to install too many libraries/dependencies if you can get away with it. If it doesn't take to long to write the code for a particular task yourself, then avoid using a library. When looking for a library, always check to make sure that expo has an appropriate package for the task at hand.

Do not be afraid of writing native code if needed, especially if there are no well maintained packages for the task at hand. At the very least, you should learn to understand basic Objective C, Swift, Kotlin, and Java as react native is built on top of all 4 languages.

## TiFShared

If you're working on code that can be shared between the frontend and backend codebases, then submit it to our [shared](https://github.com/tifapp/TiFShared) repo. We use `TiFShared` as a dependency of this project, and it contains crucial model types and utility functions in our codebase.

## Troubleshooting

If you're having issues, please reach out on slack. If you're dealing with a configuration issue of some kind, please edit [this "what the fuck" document](https://github.com/tifapp/TiFShared/wiki/WTF-Issues) with details on the issue, and add every step you took to solve the issue to that document. Keeping a past record of issues is important for preventing issues in the future.

## Appendix

- React Native Docs: <https://reactnative.dev/>
- Expo Github Repo: <https://github.com/expo/expo>
- Expo Docs: <https://docs.expo.dev/>
- Xcode Releases: <https://xcodereleases.com/>
- Android Studio Releases: <https://developer.android.com/studio/releases>
- TiFShared: <https://github.com/tifapp/TiFShared>
- Architecture: <https://github.com/tifapp/TiFShared/wiki/Configuration-Issues>
