import { View, Text, StyleSheet } from "react-native"
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

const CustomDrawerContent = (props: any) => {
  const translateX = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(0, { duration: 300 }) }],
    }
  })

  return (
    <DrawerContentScrollView {...props}>
      <Animated.View style={[styles.drawerContent, translateX]}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerHeaderText}>Missing Persons App</Text>
        </View>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Help"
          onPress={() => {
            // Navigate to help screen
          }}
        />
      </Animated.View>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    padding: 20,
    backgroundColor: "#1A237E",
  },
  drawerHeaderText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default CustomDrawerContent

