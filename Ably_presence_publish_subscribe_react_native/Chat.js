/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { StyleSheet, View, Text, AsyncStorage } from "react-native";

var realtime = require("ably").Realtime;
var ably, channel;

export default class Chat extends Component<{}> {
  constructor(props) {
    super(props);
    this.state = {
      user: "",
      msg: [],
      txt: "",
      usersCount: 0
    };
  }

  componentDidMount = () => {
    AsyncStorage.getItem("user")
      .then(value => {
        this.setState({ user: value });
        this.subscribe();
      })
      .done();
  };

  subscribe = () => {
    ably = new realtime({
      key: "Ecaj0g.JZ8Xqg:eX0US8u7zENvxfvA",
      clientId: this.state.user
    });
    channel = ably.channels.get("cog-tie");
    channel.presence.subscribe("enter", member => {
      var data = {
        msg: "joined the chat",
        user: member.clientId,
        action: "joined"
      };

      var newmsg = this.state.msg;

      newmsg.push(data);

      channel.presence.get((err, members) => {
        this.setState({ msg: newmsg, usersCount: members.length });
      });
    });

    channel.presence.subscribe("leave", member => {
      var data = {
        msg: "left the chat",
        user: member.clientId,
        action: "left"
      };

      var newmsg = this.state.msg;

      newmsg.push(data);

      channel.presence.get((err, members) => {
        this.setState({ msg: newmsg, usersCount: members.length });
      });
    });

    channel.presence.enter();

    channel.subscribe("message", msg => {
      var newmsg = this.state.msg;

      newmsg.push(msg.data);

      this.setState({ msg: newmsg, txt: "" });
    });
  };

  load_messages = () => {
    var chat = [];
    for (var i = 0; i < this.state.msg.length; i++) {
      if (this.state.msg[i].action == "joined") {
        chat.push(
          <Text style={{ padding: 3 }} key={i}>
            {this.state.msg[i].user} {this.state.msg[i].msg}
          </Text>
        );
      } else if (this.state.msg[i].action == "left") {
        chat.push(
          <Text style={{ padding: 3 }} key={i}>
            {this.state.msg[i].user} {this.state.msg[i].msg}
          </Text>
        );
      } else if (this.state.msg[i].user == this.state.user) {
        chat.push(
          <View
            key={i}
            style={{
              width: "auto",
              backgroundColor: "rgb(244, 226, 96)",
              alignSelf: "flex-start",
              padding: 10,
              borderRadius: 25,
              marginBottom: 5
            }}
          >
            <Text> {this.state.msg[i].msg}  </Text>
          </View>
        );
      } else {
        chat.push(
          <View key={i}>
            <View
              style={{
                width: "auto",
                backgroundColor: "rgb(125, 185, 232)",
                alignSelf: "flex-end",
                padding: 10,
                borderRadius: 25
              }}
            >
              <Text>
                {" "}{this.state.msg[i].msg}{" "}
              </Text>
            </View>
            <Text
              style={{
                width: "auto",
                alignSelf: "flex-end",
                paddingRight: 10,
                marginBottom: 5,
                fontSize: 6
              }}
            >
              {this.state.msg[i].user}
            </Text>
          </View>
        );
      }
    }
    return chat;
  };

  submitChat = () => {
    if (this.state.txt != "") {
      fetch("XXX_API_ROUTE/send_message", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          msg: this.state.txt,
          name: this.state.user,
          action: "chat"
        })
      })
        .then(response => response.json())
        .then(responseJson => {})
        .catch(error => {
          console.error(error);
        });
    }
  };

  leaveChat = () => {
    AsyncStorage.removeItem("user");
    channel.presence.leave();
    this.setState({ user: "" });
    this.props.handler();
  };

  render = () => {
    return <View style={styles.container} />;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5FCFF",
    paddingTop: 10
  }
});
