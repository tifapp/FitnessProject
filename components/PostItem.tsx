import { APIListOperations } from "@components/APIList";
import React, { useState, useEffect } from "react";
import {  StyleSheet, Text, View } from "react-native";
import { Post } from "src/models";
import IconButton from "./common/IconButton";
import { ProfileImageAndName } from "./ProfileImageAndName";
import { Divider } from "react-native-elements";
import useGenerateRandomColor from "@hooks/generateRandomColor";

interface Props {
  item: Post & {taggedUsers?: string[]; likedByYou?: boolean},
  likes: number,
  reportPost: (timestamp: string, author: string) => Promise<any>,
  replyButtonHandler?: () => void,
  writtenByYou: boolean,
  isVisible?: boolean,
  shouldSubscribe?: boolean,
  operations: APIListOperations<Post>,
  timeUntil: number, // Int just to test UI 
  maxOccupancy: number,
  hasInvitations: boolean
}

const PostItem = ({
  item,
  writtenByYou,
  replyButtonHandler,
  //receiver,
  //showTimestamp,
  //newSection,
  reportPost,
  isVisible,
  shouldSubscribe,
  likes,
  //replies,
  //index,
  operations,
  timeUntil, // For now I have it as an int to test the UI, probably change it later
  maxOccupancy,
  hasInvitations,
} : Props) => {
  const {color, generateColor} = useGenerateRandomColor();
  const [requested, setRequested] = useState(false); // If user has requested to join
  const [numInvitations, setNumInvitations] = useState(0) // Number of requested invitations
  const [isHours, setIsHours] = useState(true); // If time limit has >= 1 hour left
  const [currentCapacity, setCurrentCapacity] = useState(5);
  const NUM_OF_LINES = 5;
  const CAPACITY_PERCENTAGE = 0.75;

  useEffect(() => {
    generateColor();

  }, []);

  const handleRequestToJoin = () => {
    if (requested) {
      setRequested(false);
      setNumInvitations(numInvitations-1);
    } else {
      setRequested(true);
      setNumInvitations(numInvitations+1);
    }
  };

  return (
    <View style={styles.secondaryContainerStyle}>
      <View
        style={[styles.spaceAround, replyButtonHandler ? {} : styles.nestedReply]}
      >
      {/* Header (name, profile pic, event dot, distance) */}
        <View
          style={[styles.flexRow, {paddingBottom: '2%'}]}
        >
          <ProfileImageAndName
            textStyle={{
              fontWeight: writtenByYou ? "bold" : "normal",
            }}
            style={styles.profile}
            userId={item.userId}
          />
          <IconButton
              style={styles.eventDot}
              iconName={"lens"}
              size={15}
              color={color}
              onPress={() => null}
            />
          <Text style={styles.distance}>0 mi</Text>
        </View>

        <Divider style={styles.divider}/>

        {/* Description */}
        <View style={styles.description}>
          <Text numberOfLines={NUM_OF_LINES}
            style={{
              paddingHorizontal: '3%'
            }}
          >
            {item.description}
          </Text>
        </View>

        {/* Bottom Left Icons (time until event, max occupancy) */}
        <View style={[styles.flexRow, {paddingBottom: '1%'}]}>
          <View style={[styles.flexRow, {paddingLeft: '2%'}]}>
            {timeUntil != null ?
              <View style={{flexDirection: 'row'}}>
                <IconButton
                  iconName={"query-builder"}
                  size={22}
                  color={isHours ? 'grey' : 'red'}
                  onPress={() => null}
                />
                <Text style={[
                    styles.numHours,
                    {color: isHours ? 'grey' : 'red'}
                  ]}
                >{timeUntil}{isHours ? 'hrs' : 'min'}
                </Text>
              </View> : null
            }
            {timeUntil && maxOccupancy != null ?
              <IconButton
                style={styles.paddingDot}
                iconName={"lens"}
                size={7}
                color={"grey"}
                onPress={() => null}
              /> : null
            }
            {maxOccupancy ?
              <View style={styles.maxLimit}>
                <IconButton 
                  iconName={"person-outline"}
                  size={22}
                  color={(currentCapacity >= Math.floor(maxOccupancy*CAPACITY_PERCENTAGE))
                    ? 'red' : 'grey'}
                  onPress={() => null}
                />
                <Text style={[
                    {textAlignVertical:'center'},
                    {color: (currentCapacity >= Math.floor(maxOccupancy*CAPACITY_PERCENTAGE))
                      ? 'red' : 'grey'
                    }
                  ]}>{currentCapacity}/{maxOccupancy}</Text>
              </View> : null
            }
          </View>

          {/* Bottom Right Icons (invitations, comments, more tab) */}
          <View style={styles.iconsBottomRight}>
            {hasInvitations ?
              <View style={styles.iconsBottomRight}>
                <Text 
                  style={[
                    styles.numbersBottomRight,
                    {color: requested ? color : "black"}
                  ]}
                >{numInvitations > 0 ? numInvitations : null}</Text>
                <IconButton
                  style={{paddingLeft: '6%'}}
                  iconName={"person-add"}
                  size={22}
                  color={requested ? color : "black"}
                  onPress={handleRequestToJoin}
                />
              </View> : null
            }
            <Text style={styles.numbersBottomRight}>0</Text>
            <IconButton
              style={{paddingLeft: '2%'}}
              iconName={"messenger"}
              size={18}
              color={"black"}
              onPress={() => null}
            />
            <IconButton
              style={{paddingLeft: '3%'}}
              iconName={"more-vert"}
              size={24}
              color={"black"}
              onPress={() => null}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default React.memo(PostItem);

const styles = StyleSheet.create({
  secondaryContainerStyle: {
    backgroundColor: "#f7f7f7"
  },
  spaceAround: {
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    flex: 1,
    flexDirection: 'column'
  },
  flexRow: {
    flex: 1,
    flexDirection: 'row'
  },
  distance: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'center',
    textAlign: 'right',
    paddingRight: '4%',
    paddingTop: '2%'
  },
  divider: {
    width: '94%',
    height: 1,
    alignSelf: 'center'
  },
  description: {
    paddingBottom: '3%',
    paddingTop: '2%'
  },
  iconsBottomRight: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  numbersBottomRight: {
    paddingRight: 3,
    textAlignVertical:'center',
  },
  paddingDot: {
    paddingTop: '2%',
    paddingRight: '3%',
    paddingLeft: '1.5%'
  },
  eventDot: {
    paddingRight: '2%',
    paddingTop: '2%'
  },
  profile: {
    flexDirection: "row",
    paddingLeft: "3%",
    paddingTop: '2%'
  },
  maxLimit: {
    flexDirection: 'row',
  },
  numHours: {
    textAlignVertical:'center',
    paddingLeft: '1%'
  },
  nestedReply: {
    marginBottom: 20,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,

    elevation: 1,
  },
});
