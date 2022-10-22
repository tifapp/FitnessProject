import React from "react";
import { TextInput, TextInputProps } from "react-native";

interface Props extends TextInputProps {

}

class ExpandingTextInput extends React.Component<Props> {
  constructor(prop: Props) {
    super(prop);
    this.state = {
      height: 0,
    };
  }

  focus() {
    this.textInput && this.textInput.focus();
  }

  render() {
    return (
      <TextInput
        {...this.props}
        ref={(view) => (this.textInput = view)}
        multiline
        onContentSizeChange={(event) => {
          if (event && event.nativeEvent && event.nativeEvent.contentSize) {
            this.setState({
              height: event.nativeEvent.contentSize.height,
            });
          }
          this.props.onContentSizeChange &&
            this.props.onContentSizeChange(event);
        }}
        style={[this.props.style, { height: Math.max(35, this.state.height) }]}
      />
    );
  }
}

export default ExpandingTextInput; 
