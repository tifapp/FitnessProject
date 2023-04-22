/*
 * Copyright 2017-2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool
} from "amazon-cognito-identity-js"
import { I18n, Logger } from "aws-amplify"
import { AmplifyThemeType } from "aws-amplify-react-native/src/AmplifyTheme"
import {
  AmplifyButton,
  ErrorRow,
  FormField,
  Header,
  LinkCell,
  SignedOutMessage,
  Wrapper
} from "aws-amplify-react-native/src/AmplifyUI"
import AuthPiece, {
  IAuthPieceProps,
  IAuthPieceState
} from "aws-amplify-react-native/src/Auth/AuthPiece"
import { CognitoIdentityCredentials } from "aws-sdk"
import React from "react"
import { View } from "react-native"

const logger = new Logger("SignIn")

interface ISignInProps extends IAuthPieceProps {}

interface ISignInState extends IAuthPieceState {
  password?: string
}

export default class SignIn extends AuthPiece<ISignInProps, ISignInState> {
  constructor (props: ISignInProps) {
    super(props)

    this._validAuthStates = ["signIn", "signedOut", "signedUp"]
    this.state = {
      username: null,
      password: null,
      error: null
    }

    this.checkContact = this.checkContact.bind(this)
    this.signIn = this.signIn.bind(this)
  }

  signIn () {
    const username = this.getUsernameFromInput() || ""
    const { password } = this.state

    const userPool = new CognitoUserPool({
      UserPoolId: "YOUR_COGNITO_USER_POOL_ID",
      ClientId: "YOUR_COGNITO_APP_CLIENT_ID"
    })

    const cognitoUser = new CognitoUser({
      Username: username.trim().toLowerCase().replace(/\s/g, ""),
      Pool: userPool
    })

    const authenticationDetails = new AuthenticationDetails({
      Username: username.trim().toLowerCase().replace(/\s/g, ""),
      Password: password
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        // Update authDetails with the new session
        global.authDetails.isLoggedIn = true
        global.authDetails.jwtToken = result.getIdToken().getJwtToken()
        global.authDetails.awsCredentials = new CognitoIdentityCredentials({
          IdentityPoolId: "YOUR_COGNITO_IDENTITY_POOL_ID",
          Logins: {
            [`cognito-idp.${"YOUR_AWS_REGION"}.amazonaws.com/${"YOUR_COGNITO_USER_POOL_ID"}`]:
              result.getIdToken().getJwtToken()
          }
        })
        global.authDetails.cognitoUser = cognitoUser

        // ... rest of the code (check MFA, handle NEW_PASSWORD_REQUIRED, etc.)
        // Use 'result.getAccessToken().getJwtToken()' if you need the access token

        // Check MFA and other challenges
        if (cognitoUser.challengeName === "SMS_MFA") {
          this.changeState("confirmSignIn", cognitoUser)
        } else if (cognitoUser.challengeName === "NEW_PASSWORD_REQUIRED") {
          this.changeState("requireNewPassword", cognitoUser)
        } else {
          this.checkContact(cognitoUser)
        }
      },
      onFailure: (err) => {
        if (err.code === "PasswordResetRequiredException") {
          this.changeState("forgotPassword", username)
        } else {
          this.error(err)
        }
      }
    })
  }

  showComponent (theme: AmplifyThemeType) {
    return (
      <Wrapper>
        <View style={theme.section}>
          <View>
            <Header theme={theme}>{I18n.get("Sign in to your account")}</Header>
            <View style={theme.sectionBody}>
              {this.renderUsernameField(theme)}
              <FormField
                theme={theme}
                onChangeText={(text) => this.setState({ password: text })}
                label={I18n.get("Password")}
                placeholder={I18n.get("Enter your password")}
                secureTextEntry={true}
                required={true}
              />
              <AmplifyButton
                text={I18n.get("Sign In").toUpperCase()}
                theme={theme}
                onPress={this.signIn}
                disabled={
                  !!(!this.getUsernameFromInput() && this.state.password)
                }
              />
            </View>
            <View style={theme.sectionFooter}>
              <LinkCell
                theme={theme}
                onPress={() => this.changeState("forgotPassword")}
              >
                {I18n.get("Forgot Password")}
              </LinkCell>
              <LinkCell
                theme={theme}
                onPress={() => this.changeState("signUp")}
              >
                {I18n.get("Sign Up")}
              </LinkCell>
            </View>
            <ErrorRow theme={theme}>{this.state.error}</ErrorRow>
          </View>
          <SignedOutMessage {...this.props} />
        </View>
      </Wrapper>
    )
  }
}
