import React from 'react';
import {getLinkPreview} from 'link-preview-js';
import PropTypes from 'prop-types';
import {Image, Linking, Platform, Text, TouchableOpacity, View, ViewPropTypes} from 'react-native';

const linkify = require('linkify-it')()

export default class RNUrlPreview extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isUri: false,
      link: undefined,
      linkTitle: undefined,
      linkDesc: undefined,
      linkFavicon: undefined,
      linkImg: undefined,
    };
    this.getPreview(props.text, props.requestOptions);
  }

  getPreview = (text, options) => {
    const {onError, onLoad} = this.props;
    if (linkify.pretest(text) && linkify.test(text)) {
        const url = linkify.match(text)[0].url
        getLinkPreview(url, options)
          .then(data => {
            onLoad(data);
            this.setState({
              isUri: true,
              link: url,
              linkTitle: data.title ? data.title : undefined,
              linkDesc: data.description ? data.description : undefined,
              linkImg:
                data.images && data.images.length > 0
                  ? data.images.find(function(element) {
                      return element.includes('.png') || element.includes('.jpg') || element.includes('.jpeg');
                    })
                  : undefined,
              linkFavicon: data.favicons && data.favicons.length > 0 ? data.favicons[data.favicons.length - 1] : undefined,
            });
          })
          .catch(error => {
            onError(error);
            this.setState({isUri: false});
          });
    }
  };

  componentDidUpdate(nextProps) {
    if (nextProps.text !== this.props.text) {
      this.getPreview(nextProps.text);
    } else if (nextProps.text == null) {
      this.setState({isUri: false});
    }
  }

  _onLinkPressed = () => {
    this.props.onPress && this.state.isUri ? this.props.onPress(this.state.link) : Linking.openURL(this.state.link);
  };

  renderImage = (imageLink, faviconLink, imageStyle, faviconStyle, imageProps) => {
    return imageLink ? (
      <Image style={imageStyle} source={{uri: imageLink}} {...imageProps} />
    ) : faviconLink ? (
      <Image style={faviconStyle} source={{uri: faviconLink}} {...imageProps} />
    ) : null;
  };
  renderText = (showTitle, showDescription, title, description, textContainerStyle, titleStyle, descriptionStyle, titleNumberOfLines, descriptionNumberOfLines) => {
    return (
      <View style={textContainerStyle}>
        {showTitle && (
          <Text numberOfLines={titleNumberOfLines} style={titleStyle}>
            {title}
          </Text>
        )}
        {showDescription && (
          <Text numberOfLines={descriptionNumberOfLines} style={descriptionStyle}>
            {description}
          </Text>
        )}
      </View>
    );
  };
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
    imageProps,
  ) => {
    return (
      <TouchableOpacity style={[styles.containerStyle, containerStyle]} activeOpacity={0.9} onPress={() => this._onLinkPressed()}>
        {this.renderImage(imageLink, faviconLink, imageStyle, faviconStyle, imageProps)}
        {this.renderText(showTitle, showDescription, title, description, textContainerStyle, titleStyle, descriptionStyle, titleNumberOfLines, descriptionNumberOfLines)}
      </TouchableOpacity>
    );
  };

  render() {
    const {
      text,
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
      onPress,
    } = this.props;
    return this.state.isUri
      ? this.renderLinkPreview(
          containerStyle,
          this.state.linkImg,
          this.state.linkFavicon,
          imageStyle,
          faviconStyle,
          title,
          description,
          this.state.linkTitle,
          this.state.linkDesc,
          textContainerStyle,
          titleStyle,
          descriptionStyle,
          titleNumberOfLines,
          descriptionNumberOfLines,
          imageProps,
          onPress,
        )
      : null;
  }
}

const styles = {
  containerStyle: {
    flexDirection: 'row',
  },
};

RNUrlPreview.defaultProps = {
  onLoad: () => {},
  onError: () => {},
  text: null,
  requestOptions: {},
  containerStyle: {
    backgroundColor: 'rgba(239, 239, 244,0.62)',
    alignItems: 'center',
  },
  imageStyle: {
    width: Platform.isPad ? 160 : 110,
    height: Platform.isPad ? 160 : 110,
    paddingRight: 10,
    paddingLeft: 10,
  },
  faviconStyle: {
    width: 40,
    height: 40,
    paddingRight: 10,
    paddingLeft: 10,
  },
  textContainerStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 10,
  },
  title: true,
  description: true,
  titleStyle: {
    fontSize: 17,
    color: '#000',
    marginRight: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
  },
  titleNumberOfLines: 2,
  descriptionStyle: {
    fontSize: 14,
    color: '#81848A',
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  descriptionNumberOfLines: Platform.isPad ? 4 : 3,
  imageProps: {resizeMode: 'contain'},
};

RNUrlPreview.propTypes = {
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  text: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  imageStyle: ViewPropTypes.style,
  faviconStyle: ViewPropTypes.style,
  textContainerStyle: ViewPropTypes.style,
  title: PropTypes.bool,
  description: PropTypes.bool,
  titleStyle: Text.propTypes.style,
  titleNumberOfLines: Text.propTypes.numberOfLines,
  descriptionStyle: Text.propTypes.style,
  descriptionNumberOfLines: Text.propTypes.numberOfLines,
  requestOptions: PropTypes.shape({
    headers: PropTypes.objectOf(PropTypes.string),
    imagesPropertyType: PropTypes.string,
    proxyUrl: PropTypes.string 
  }),
  onPress: PropTypes.func,
};