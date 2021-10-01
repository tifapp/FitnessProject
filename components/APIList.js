import React, { PureComponent } from "react";
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

class APIList extends PureComponent { //we need to make this a class to use refs from the parent
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingMore: false,
      nextToken: null,
      refreshing: false,
      loadingInitial: false,
    };
  }

  componentDidMount() {
    if (this.props.initialState != null) {
      //console.log(this.props.initialState);
      this.setState(this.props.initialState);
    } else {
      if (!this.props.ignoreInitialLoad) {
        this.setState({loadingInitial: true});
        this.fetchDataAsync(true)
        .finally(() => this.setState({loadingInitial: false}));
      }
    }
  }
  
  componentWillUnmount() {
    console.log("list is unmounting");
    if (this.props.saveState != null) {
      console.log("saving list state");
      this.props.saveState(this.state);
    }
  }

  loadMore = () => {
    //console.log("can we load more???");
    if (!this.state.loadingMore && this.state.nextToken != null) { //if we don't check this, the list will repeat endlessly
      this.setState({ loadingMore: true });
      this.fetchDataAsync(false)
        .finally(() => { this.setState({ loadingMore: false }) });
    } else {
      this.setState({ loadingMore: false });
    }
  }

  onRefresh = () => {
    this.setState({ refreshing: true });
    this.fetchDataAsync(true)
      .then(() => { this.setState({ refreshing: false }) })
      .catch();
  };

  fetchDataAsync = async (beginning, voidResultsFunction) => {
    //do not refetch if the user themselves added or updated a post
    //if new posts are being added don't refetch the entire batch, only append the new posts
    //if a post is being updated don't refetch the entire batch, only update that post
    //if a lot of new posts are being added dont save all of them, paginate them at like 100 posts

    this.setState({ loading: true });
    try {
      let nextToken = this.state.nextToken;
      let results = [];

      const wasBeginning = beginning;

      //if we're trying to chain queries until we reach the end of the database, this would be the most efficient way to do it
      do {
        const query = await API.graphql(
          graphqlOperation(this.props.queryOperation, { limit: (nextToken == null || beginning) ? this.props.initialAmount : this.props.additionalAmount, nextToken: beginning ? null : nextToken, ...this.props.filter || {}, })
        );

        beginning = false;
        nextToken = query.data[Object.keys(query.data)[0]].nextToken
        results = [...query.data[Object.keys(query.data)[0]].items, ...results]
        //console.log(results);
        //console.log("completed iteration of fetching, amount of results are ", results.length);
      } while (results.length < (wasBeginning ? this.props.initialAmount : this.props.additionalAmount) && nextToken != null);

      if (this.props.processingFunction != null && results != null && results.length > 0) {
        results = await Promise.resolve(this.props.processingFunction(results)); //make sure this isn't undefined! in processingfunction return the results in the outermost layer!
      }

      if (voidResultsFunction != null) {
        if (voidResultsFunction()) {this.setState({ loading: false }); return;}
      }

      console.log("starting initial function")

      if (this.state.loadingInitial && this.props.initialLoadFunction != null) {
        this.props.initialLoadFunction(results);
      }

      console.log("finished initial function")

      if (!wasBeginning)
        this.props.setDataFunction([...this.props.data, ...results]);
      else
        this.props.setDataFunction(results ?? []);

      this.setState({ nextToken: nextToken });

    } catch (err) {
      console.log("error in displaying data: ", err);
    }
    this.setState({ loading: false });
  };

  render() {
    return (
      <View style={this.props.style}>
        {
          this.state.loadingInitial || (this.state.loading && !this.state.loadingMore && !this.state.refreshing)
            ? <ActivityIndicator
              size="large"
              color="#000000"
              style={{
                alignSelf: 'stretch',
                flex: 1,
                flexGrow: 1,
                justifyContent: 'space-around',
                justifyContent: "center",
              }} />
            :
            <FlatList
                viewabilityConfig={this.props.viewabilityConfig}
                onScroll={this.props.onScroll}
                scrollEventThrottle={0}
                ref={this.props.ListRef}
                ListHeaderComponent={this.props.ListHeaderComponent}
                horizontal={this.props.horizontal}
                contentContainerStyle={{ flexGrow: 1 }}
                data={this.props.data}
                refreshControl={
                  this.props.notRefreshable ? null :
                  <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                }
                renderItem={this.props.renderItem}
                keyExtractor={this.props.keyExtractor}
                onEndReached={this.props.additionalAmount > 0 ? this.loadMore : ()=>{}}
                onEndReachedThreshold={this.props.onEndReachedThreshold}
                ListEmptyComponent={this.props.ListEmptyComponent}
                getItemLayout={this.props.getItemLayout}
                maxToRenderPerBatch={this.props.additionalAmount > 0 ? this.props.additionalAmount : 1} //we'll have to do more tests with these numbers. maxrender 6 and batchingperiod 60 with an additionalamount of 10 and lower caused frequent restarting on my android. seems to be the items have to be rendered first, if they render afterwards (show up as blank, then pop in) then they cause the list to crash.
                //removeClippedSubviews={true} //documentation says this may reduce crashing but causes glitches on ios
                updateCellsBatchingPeriod={20}//numbers could vary based on device and size of memory. this one should be as big as possible, but 50 and above is too large.
                windowSize={21}
                onViewableItemsChanged={this.props.onViewableItemsChanged}
              />
        }

        {
          this.state.loadingMore
            ?
            <ActivityIndicator
              size="large"
              color="#26c6a2"
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 40
              }} />
            : null
        }
      </View>
    )
  }
}

APIList.defaultProps = {
  onEndReachedThreshold: 0,
  initialAmount: 10,
  additionalAmount: 15, //should be larger than initialamount to reduce scrolling/delay and for the sake of maxrenderperbatch to reduce blank spaces on initial batch
  style: {
    alignSelf: "stretch",
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
  }
}

export default APIList;