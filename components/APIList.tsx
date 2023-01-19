import API, { GraphQLQuery } from "@aws-amplify/api";
import { graphqlOperation } from "aws-amplify";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  LayoutAnimation, ListRenderItemInfo,
  RefreshControl,
  Text,
  View
} from "react-native";

export type APIListRefType<T> = {
  addItem: (newItem: T, alreadyExists?: (item: T) => boolean) => T[];
  removeItem: (toRemove: number | ((_: T) => boolean)) => T[];
  replaceItem: (itemMatcher: ((_: T) => boolean), newItem: Partial<T>) => T[];
  replaceList: (newList: T[]) => T[];
  getList: () => Readonly<T[]>;
  refresh: (shouldInvalidateResults?: () => boolean) => void;
} | null;

export interface APIListOperations<T> {
  removeItem: () => void;
  replaceItem: (newItem: Partial<T>) => void;
}

export type APIListRenderItemInfo<T> = (info: ListRenderItemInfo<T>, operations: APIListOperations<T>) => React.ReactElement | null;

interface Props<T> extends Omit<FlatListProps<T>, "data" | "renderItem"> {
  queryOperation: string;
  queryOperationName: string;
  initialAmount?: number;
  additionalAmount?: number;
  ignoreInitialLoad?: boolean;
  notRefreshable?: boolean;

  processingFunction?: (_: T[]) => T[];
  initialLoadFunction?: (_: T[]) => void;
  ListRef?: React.RefObject<FlatList>;
  ListEmptyMessage?: string;
  filter?: any; //see amplify docs
  renderItem: APIListRenderItemInfo<any>;
}

const APIList = <T,S>({
  ignoreInitialLoad,
  initialLoadFunction,
  processingFunction,
  initialAmount = 10,
  additionalAmount = 15, //should be larger than initialamount to reduce scrolling/delay and for the sake of maxrenderperbatch to reduce blank spaces on initial batch
  style = {
    alignSelf: "stretch",
    flex: 1,
    flexGrow: 1,
    justifyContent: "center",
  },
  queryOperation,
  queryOperationName,
  notRefreshable,
  ListEmptyMessage,
  ListRef,
  filter,
  renderItem,
  keyExtractor,
  ...rest
}: Props<T>, ref: React.Ref<APIListRefType<T>>) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isInitiallyLoading, setIsInitiallyLoading] = useState<boolean>(false);
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    if (!ignoreInitialLoad) {
      setIsInitiallyLoading(true);
      fetchDataAsync(true).finally(() => {
        setIsInitiallyLoading(false);
      });
    }
  }, []);

  const loadMore = () => {
    if (!isLoadingMore && nextToken != null) {
      setIsLoadingMore(true);
      fetchDataAsync(false).finally(() => {
        setIsLoadingMore(false);
      });
    } else {
      setIsLoadingMore(false);
    }
  };

  const refresh = (shouldInvalidateResults?: () => boolean) => {
    setIsRefreshing(true);
    fetchDataAsync(true, shouldInvalidateResults)
      .then(() => {
        setIsRefreshing(false);
      })
      .catch();
  };
  
  useImperativeHandle(ref, () => ({
    addItem(newItem: T, alreadyExists?: (item: T) => boolean): T[] {
      if (!newItem || !alreadyExists || data.find(alreadyExists))
        return data;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const results = [newItem, ...data];
      setData(results);
      return results;
    },

    removeItem(toRemove: number | ((_: T) => boolean)): T[] {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  
      if (typeof toRemove === "number") {
        const results = data.slice(toRemove, 1);
        setData(results);
        return results;
      } else {
        const results = data.filter((item) => !toRemove(item));
        setData(results);
        return results;
      }
    },

    replaceItem(itemMatcher: ((_: T) => boolean), newItem: Partial<T>): T[] {
      const results = data.map((item) => itemMatcher(item) ? {...item, ...newItem} : item);
      setData(results);
      return results;
    },
    
    replaceList(newList: T[]): T[] {
      setData(newList);
      return newList;
    },
    
    getList(): Readonly<T[]> {
      return data;
    },

    refresh,
  }));

  const fetchDataAsync = async (isFirstFetch: boolean, shouldInvalidateResults?: () => boolean) => {
    //do not refetch if the user themselves added or updated a post
    //if new posts are being added don't refetch the entire batch, only append the new posts
    //if a post is being updated don't refetch the entire batch, only update that post
    //if a lot of new posts are being added dont save all of them, paginate them at like 100 posts

    setIsLoading(true);
    try {
      let toBeNextToken = nextToken;
      let results: T[] = [];

      const wasFirstFetch = isFirstFetch;

      do {
        //@ts-ignore
        const query = await API.graphql<GraphQLQuery<{[queryOperationName]: [S]}>>(
          graphqlOperation(queryOperation, {
            limit:
              toBeNextToken == null || isFirstFetch
                ? initialAmount
                : additionalAmount,
            nextToken: isFirstFetch ? null : toBeNextToken,
            ...(filter || {}),
          })
        );

        isFirstFetch = false;
        //@ts-ignore
        toBeNextToken = query.data?.[queryOperationName].nextToken;
        //@ts-ignore
        results = [...query.data?.[queryOperationName].items, ...results];
      } while (
        results.length <
          (wasFirstFetch
            ? initialAmount
            : additionalAmount) &&
        nextToken != null
      );

      if (
        processingFunction != null &&
        results != null &&
        results.length > 0
      ) {
        results = await Promise.resolve(processingFunction(results));
      }
      
      if (shouldInvalidateResults?.()) {
        setIsLoading(false);
        return;
      }

      if (isInitiallyLoading && initialLoadFunction != null) {
        initialLoadFunction(results);
      }

      if (!wasFirstFetch)
        setData(data => [...data, ...results]);
      else setData( results ?? [] );

      setNextToken(toBeNextToken);
    } catch (err) {
      console.warn("error in displaying data: ", err);
    }
    setIsLoading(false);
  };

  return (
    <View style={style}>
      {isInitiallyLoading ||
        (isLoading &&
          !isLoadingMore &&
          !isRefreshing) ? (
          <ActivityIndicator
            size="large"
            color="#000000"
            style={{
              alignSelf: "stretch",
              flex: 1,
              flexGrow: 1,
              justifyContent: "center",
            }}
          />
        ) : (
          <FlatList
            {...rest}
            scrollEventThrottle={0}
            ref={ListRef}
            contentContainerStyle={{ flexGrow: 1 }}
            data={data}
            refreshControl={
              notRefreshable ? undefined : (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={refresh}
                />
              )
            }
            onEndReached={
              additionalAmount > 0 ? loadMore : null
            }
            ListEmptyComponent={
              <Text
                style={{
                  alignSelf: "center",
                  justifyContent: "center",
                  color: "gray",
                  marginVertical: 30,
                  fontSize: 15,
                  fontWeight: "bold",
                }}
              >
                {ListEmptyMessage}
              </Text>
            }
            maxToRenderPerBatch={
              additionalAmount > 0 ? additionalAmount : 1
            } //we'll have to do more tests with these numbers. maxrender 6 and batchingperiod 60 with an additionalamount of 10 and lower caused frequent restarting on my android. seems to be the items have to be rendered first, if they render afterwards (show up as blank, then pop in) then they cause the list to crash.
            //removeClippedSubviews={true} //documentation says this may reduce crashing but causes glitches on ios
            updateCellsBatchingPeriod={20} //numbers could vary based on device and size of memory. this one should be as big as possible, but 50 and above is too large.
            windowSize={21}
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator
                  size="large"
                  color="#26c6a2"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 40,
                  }}
                />
              ) : null
            }
            renderItem={(info) => renderItem(info, {
              removeItem: () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              
                setData(data => data.filter((item, index) => keyExtractor?.(item, index) !== keyExtractor?.(info.item, info.index)));
              },
              replaceItem: (newItem: Partial<T>) => {
                setData(data => data.map((item, index) => keyExtractor?.(item, index) === keyExtractor?.(info.item, info.index) ? {...item, ...newItem} : item));
              }
            })}
            keyExtractor={keyExtractor}
          />
        )}
    </View>
  );
};

export default forwardRef(APIList);