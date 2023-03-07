/* eslint-disable react/prop-types */
import React from "react"
import {
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View
} from "react-native"

export default class RNUrlPreview extends React.PureComponent {
  _onLinkPressed = () => {
    this.props.onPress
      ? this.props.onPress(this.props.urlPreview.url)
      : Linking.openURL(this.props.urlPreview.url)
  }

  renderImage = (
    imageLink,
    faviconLink,
    imageStyle,
    faviconStyle,
    imageProps
  ) => {
    return imageLink
      ? (
        <Image
          style={{
            height: 81,
            width: 144,
            resizeMode: "cover"
          }}
          resizeMode="cover"
          source={{ uri: imageLink }}
          {...imageProps}
        />
      )
      : faviconLink
        ? (
          <Image
            style={{
              height: 81,
              width: 81,
              resizeMode: "cover"
            }}
            resizeMode="cover"
            source={{ uri: faviconLink }}
            {...imageProps}
          />
        )
        : null
  }

  renderText = (
    showTitle,
    showDescription,
    title,
    description,
    textContainerStyle,
    titleStyle,
    descriptionStyle,
    titleNumberOfLines,
    descriptionNumberOfLines
  ) => {
    return (
      <View style={textContainerStyle}>
        {showTitle && (
          <Text numberOfLines={2} style={titleStyle}>
            {title}
          </Text>
        )}
        {showDescription && (
          <Text numberOfLines={2} style={descriptionStyle}>
            {description}
          </Text>
        )}
      </View>
    )
  }

  renderLinkPreview = (
    containerStyle,
    imageLink,
    faviconLink,
    imageStyle,
    faviconStyle,
    showTitle,
    showDescription,
    title,
    description,
    textContainerStyle,
    titleStyle,
    descriptionStyle,
    titleNumberOfLines,
    descriptionNumberOfLines,
    imageProps
  ) => {
    return (
      <TouchableOpacity
        style={[styles.containerStyle, containerStyle]}
        activeOpacity={0.9}
        onPress={() => this._onLinkPressed()}
      >
        {this.renderImage(
          imageLink,
          faviconLink,
          imageStyle,
          faviconStyle,
          imageProps
        )}
        {this.renderText(
          showTitle,
          showDescription,
          title,
          description,
          textContainerStyle,
          titleStyle,
          descriptionStyle,
          titleNumberOfLines,
          descriptionNumberOfLines
        )}
      </TouchableOpacity>
    )
  }

  render () {
    const {
      containerStyle,
      imageStyle,
      faviconStyle,
      textContainerStyle,
      title,
      description,
      titleStyle,
      titleNumberOfLines,
      descriptionStyle,
      descriptionNumberOfLines,
      imageProps,
      onPress
    } = this.props
    return this.props.urlPreview
      ? this.renderLinkPreview(
        containerStyle,
        this.props.urlPreview.images &&
            this.props.urlPreview.images.length > 0
          ? this.props.urlPreview.images.find(function (element) {
            return (
              element.includes(".png") ||
                  element.includes(".jpg") ||
                  element.includes(".jpeg")
            )
          })
          : undefined,
        this.props.urlPreview.favicons &&
            this.props.urlPreview.favicons.length > 0
          ? this.props.urlPreview.favicons[
            this.props.urlPreview.favicons.length - 1
          ]
          : undefined,
        imageStyle,
        faviconStyle,
        title,
        description,
        this.props.urlPreview.title ?? undefined,
        this.props.urlPreview.description ?? undefined,
        textContainerStyle,
        titleStyle,
        descriptionStyle,
        titleNumberOfLines,
        descriptionNumberOfLines,
        imageProps,
        onPress
      )
      : null
  }
}

const styles = {
  containerStyle: {
    flexDirection: "row"
  }
}

RNUrlPreview.defaultProps = {
  onLoad: () => {},
  onError: () => {},
  text: null,
  requestOptions: {},
  containerStyle: {
    backgroundColor: "rgba(239, 239, 244,0.62)",
    alignItems: "center"
  },
  imageStyle: {
    width: Platform.isPad ? 160 : 110,
    height: Platform.isPad ? 160 : 110,
    paddingRight: 10,
    paddingLeft: 10
  },
  faviconStyle: {
    width: 40,
    height: 40,
    paddingRight: 10,
    paddingLeft: 10
  },
  textContainerStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 10
  },
  title: true,
  description: true,
  titleStyle: {
    fontSize: 14,
    color: "#000",
    marginRight: 0,
    marginBottom: 0,
    alignSelf: "flex-start"
  },
  titleNumberOfLines: 2,
  descriptionStyle: {
    fontSize: 12,
    color: "#81848A",
    marginRight: 0,
    alignSelf: "flex-start"
  },
  descriptionNumberOfLines: Platform.isPad ? 4 : 3,
  imageProps: { resizeMode: "contain" }
}

// RNUrlPreview.propTypes = {
//   onLoad: PropTypes.func,
//   onError: PropTypes.func,
//   text: PropTypes.string,
//   containerStyle: ViewPropTypes.style,
//   imageStyle: ViewPropTypes.style,
//   faviconStyle: ViewPropTypes.style,
//   textContainerStyle: ViewPropTypes.style,
//   title: PropTypes.bool,
//   description: PropTypes.bool,
//   titleStyle: Text.propTypes.style,
//   titleNumberOfLines: Text.propTypes.numberOfLines,
//   descriptionStyle: Text.propTypes.style,
//   descriptionNumberOfLines: Text.propTypes.numberOfLines,
//   requestOptions: PropTypes.shape({
//     headers: PropTypes.objectOf(PropTypes.string),
//     imagesPropertyType: PropTypes.string,
//     proxyUrl: PropTypes.string
//   }),
//   onPress: PropTypes.func
// }
