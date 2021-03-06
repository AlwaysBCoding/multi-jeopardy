$(function() {
  if($("body").hasClass("games-player")) {

    var GAMESTATEREF = new Firebase("https://leighjeopardy.firebaseio.com/games/" + window.location.pathname.split("/")[2])

    var Buzzer = React.createClass({

      componentWillMount: function() {
        this.throttledBuzzIn = _.throttle(this.buzzIn, 500)
      },

      buzzIn: function() {
        GAMESTATEREF.child("/buzzes").push({playerKey: this.props.playerKey, username: this.props.username, timestamp: Date.now() })
      },

      handleBuzz: function(event) {
        if(this.props.gameState.phase == "buzzers-active") {
          if(!this.props.gameState.buzzes) {
            this.throttledBuzzIn()
          }
        }
      },

      render: function() {
        var renderContext = this

        var classNames = ""
        classNames += "buzzer "
        switch(this.props.gameState.phase) {
          case "buzzers-active":
            this.props.gameState.buzzes ? classNames += "buzz " : classNames += "active ";
            break
          default:
            classNames += "inactive "
        }

        var BuzzTimes = _.map(this.props.gameState.buzzes, function(buzz) {
          return React.createElement("p", {className: "buzz"}, `${buzz.username} - ${buzz.timestamp - renderContext.props.gameState.buzzersActiveAt}`)
        })

        return React.createElement("div", {className: classNames, onClick: this.handleBuzz},
          React.createElement("div", {className: "buzz-times"},
            BuzzTimes
          )
        )

      }

    })

    var App = React.createClass({

      componentWillMount: function() {
        var renderContext = this
        GAMESTATEREF.on("value", function(snapshot) { renderContext.replaceState(snapshot.val()) })
      },

      render: function() {
        var renderContext = this
        var MainContent
        var SecondaryContent

        if(this.username) {
          MainContent =
          React.createElement("div", {className: "username"},
            React.createElement("p", {className: "username-text"}, this.username)
          )
          SecondaryContent =
          React.createElement(Buzzer, {gameState: this.state, playerKey: this.userRef.key(), username: this.username})
        } else {
          MainContent =
          React.createElement("div", {
            className: "join-game-button",
            onClick: function(event) {
              var username = prompt("What is your username")
              if(username) {
                renderContext.username = username
                renderContext.userRef = GAMESTATEREF.child("/connectedPlayers").push({username: username, score: 0})
                renderContext.userRef.onDisconnect().remove()
              }
            }
          },
            React.createElement("p", {}, "Join Game")
          )
          SecondaryContent =
          React.createElement("div", {}, "")
        }

        return React.createElement("div", {className: "container"},
          MainContent,
          SecondaryContent
        )
      }

    })

    React.render(React.createElement(App), document.querySelector("#js-target"))

  }
})
