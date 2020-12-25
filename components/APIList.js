import React, { Component } from "react";
import {
  StyleSheet,
  View,
  RefreshControl,
  FlatList,
  SectionList,
  ActivityIndicator,
  Text,
} from "react-native";
import { API, graphqlOperation } from "aws-amplify";

var styles = require("../styles/stylesheet");

const initialAmount = 10;
const additionalAmount = 5;

class APIList extends Component { //we need to make this a class to use refs from the parent
  constructor(props) {
    super(props);
    this.state = {
      loadingMore: false,
      nextToken: null,
      refreshing: false,
      loading: false,
    };
  }

  componentDidMount() {
    this.setState({loading: true});
    this.fetchDataAsync(true)
    .finally(() => this.setState({loading: false}));
  }

  loadMore = () => {
    if (!this.state.loadingMore && this.state.nextToken != null) { //if we don't check this, the list will repeat endlessly
      this.setState({loadingMore: true});
      this.fetchDataAsync(false)
        .finally(() => { this.setState({loadingMore: false}); });
    }
  }

  onRefresh = () => {
    this.setState({refreshing: true});
    this.fetchDataAsync(true)
      .then(() => { this.setState({refreshing: false}) })
      .catch();
  };

  myMethod() {
    console.log("MyMethod called");
  }

  fetchDataAsync = async (beginning) => {
    //do not refetch if the user themselves added or updated a post
    //if new posts are being added don't refetch the entire batch, only append the new posts
    //if a post is being updated don't refetch the entire batch, only update that post
    //if a lot of new posts are being added dont save all of them, paginate them at like 100 posts
    try {
      const query = await API.graphql(
        graphqlOperation(this.props.queryOperation, { limit: this.state.nextToken == null ? initialAmount : additionalAmount, nextToken: beginning ? null : this.state.nextToken, ...this.props.filter || {}, })
      );
      
      console.log('showing this data: ', query);
      
      this.setState({nextToken: query.data[Object.keys(query.data)[0]].nextToken});

      if (!beginning)
        this.props.setDataFunction([...this.props.data, ...query.data[Object.keys(query.data)[0]].items]); //wont work with current sectionlist implementation
      else
        this.props.setDataFunction(query.data[Object.keys(query.data)[0]].items);

    } catch (err) {
      console.log("error in displaying data: ", err);
    }
  };

  render() {
    return (
      <View style={{
        alignSelf: 'stretch',
        flex: 1,
        flexGrow: 1,
        justifyContent: 'space-around',
        justifyContent: "center",
      }}>
        {
          this.state.loading
            ? <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{
                alignSelf: 'stretch',
                flex: 1,
                flexGrow: 1,
                justifyContent: 'space-around',
                justifyContent: "center",
              }} />
            :
            this.props.sections == null
              ? <FlatList
                contentContainerStyle={{ flexGrow: 1 }}
                data={this.props.data}
                refreshControl={
                  <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                }
                renderItem={this.props.renderItem}
                keyExtractor={this.props.keyExtractor}
                onEndReached={this.loadMore}
                onEndReachedThreshold={1}
              />
              : <SectionList
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                  <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                }
                renderItem={this.props.renderItem}
                keyExtractor={this.props.keyExtractor}
                onEndReached={this.loadMore}
                onEndReachedThreshold={1}

                sections={this.props.sections}
                renderSectionHeader={({ section: { title } }) => (
                  <Text style={[styles.outlineButtonTextStyle, { marginTop: 15 }]}>{title}</Text>
                )}
                stickySectionHeadersEnabled={true}
              />
        }

        {
          this.state.loadingMore
            ?
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 200
              }} />
            : null
        }
      </View>
    )
  }
}

export default APIList;