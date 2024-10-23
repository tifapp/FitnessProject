import React, { useState } from "react"

// Import your stories

const stories = [
  {
    name: GameNavigationMeta.title,
    component: GameNavigationBasic,
    args: GameNavigationMeta.args
  },
  {
    name: EnterGoalMeta.title,
    component: EnterGoalBasic,
    args: EnterGoalMeta.args
  },
  {
    name: EnterMotivationMeta.title,
    component: EnterMotivationBasic,
    args: EnterMotivationMeta.args
  },
  {
    name: NarrationMeta.title,
    component: NarrationBasic,
    args: NarrationMeta.args
  },
  {
    name: VesselPickerMeta.title,
    component: VesselPickerBasic,
    args: VesselPickerMeta.args
  },
  {
    name: SettingsMeta.title,
    component: SettingsScreenBasic,
    args: SettingsMeta.args
  },
  {
    name: ExploreEventsMeta.title,
    component: ExploreEventsBasic,
    args: ExploreEventsMeta.args
  },
  {
    name: EventSettingsMeta.title,
    component: EventSettingsBasic,
    args: EventSettingsMeta.args
  },
  {
    name: EventSettingsDurationMeta.title,
    component: EventSettingsDurationBasic,
    args: EventSettingsDurationMeta.args
  },
  {
    name: TextFieldMeta.title,
    component: TextFieldBasic,
    args: TextFieldMeta.args
  },
  {
    name: SearchBarMeta.title,
    component: SearchBarBasic,
    args: SearchBarMeta.args
  },
  {
    name: LocationSearchMeta.title,
    component: LocationSearchBasic,
    args: LocationSearchMeta.args
  },
  {
    name: ForgotPasswordMeta.title,
    component: ForgotPasswordBasic,
    args: ForgotPasswordMeta.args
  },
  {
    name: SignUpMeta.title,
    component: SignUpBasic,
    args: SignUpMeta.args
  },
  {
    name: SignInMeta.title,
    component: SignInBasic,
    args: SignInMeta.args
  },
  {
    name: ButtonsMeta.title,
    component: ButtonsBasic,
    args: ButtonsMeta.args
  },
  {
    name: EventDetailsMeta.title,
    component: EventDetailsBasic,
    args: EventDetailsMeta.args
  },
  {
    name: RegionMonitoringMeta.title,
    component: RegionMonitoringBasic,
    args: RegionMonitoringMeta.args
  },
  {
    name: AttendeesListMeta.title,
    component: AttendeesListBasic,
    args: AttendeesListMeta.args
  },
  {
    name: EditEventDurationsMeta.title,
    component: EditEventDurationsBasic,
    args: EditEventDurationsMeta.args
  }
]


const CustomStorybookUI = () => {
  const [selectedStory, setSelectedStory] = useState(-1)

  if (selectedStory !== -1) {
    const { component: StoryComponent, args } = stories[selectedStory]
    return (
      <StoryComponent {...args} />
    )
  }

  return (
    <View style={{ flex: 1, marginHorizontal: 20, marginVertical: 50 }}>
      <FlatList
        data={stories}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{
              padding: 10,
              width: "100%",
              borderWidth: 1,
              borderColor: "gray"
            }}
            key={index}
            onPress={() => setSelectedStory(index)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

export default CustomStorybookUI
