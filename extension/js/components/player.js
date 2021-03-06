var debug = require('debug')('bandcamp:components:player');
var sprintf = require("sprintf-js").sprintf;
var React = require('react');
var PlayerAction = require('../actions/player');
var PlayerStore = require('../stores/player');

var Player = React.createClass({
  timer: null,

  getInitialState: function(){
    return {
      playerState: '',
      title: '',
      currentTime: 0.0,
      duration: 0.0
    };
  },

  componentDidMount: function(){
    PlayerStore.on('CHANGE', this.onChange);
  },

  componentWillUnmount: function(){
    PlayerStore.removeListener('CHANGE', this.onChange);
  },

  render: function(){
    var title = this.state.title;
    var url = '/';
    var currentTime = this.getCurrentTime();
    var duration = this.getDuration();
    var playButtonClass = ['playbutton'];
    if (this.state.playerState === 'PLAYING') {
      playButtonClass.push('playing');
    }
    var progressStyle = {
      left: this.getCurrentPosition() + 'px',
      top: '-2px'
    };
    var progressBarStyle = { width: '0%' };

    return (
      <table>
      <tbody>
      <tr>
        <td className="play_cell" rowSpan="2">
          <a onClick={this.onClickPlay}><div className={playButtonClass.join(' ')}></div></a>
        </td>
        <td className="track_cell" colSpan="3">
          <div className="track_info">
            <span className="title-section">
              <a className="title_link primaryText" href={url}>
                <span className="title">{title}</span>
              </a>
            </span>
            <span className="time secondaryText">
              <span className="time_elapsed">{currentTime}</span>
              <span> / </span>
              <span className="time_total">{duration}</span>
            </span>
          </div>
        </td>
      </tr>
      <tr>
        <td className="progbar_cell">
          <div className="progbar">
            <div className="progbar_empty">
              <div className="progbar_fill" style={progressBarStyle}></div>
              <div className="thumb" id="yui-gen0" style={progressStyle}></div>
            </div>
          </div>
        </td>
        <td className="prev_cell">
          <a><div className="prevbutton"></div></a>
        </td>
        <td className="next_cell">
          <a><div className="nextbutton"></div></a>
        </td>
      </tr>
      </tbody>
      </table>
    )
  },

  onClickPlay: function(e){
    if (this.state.playerState === 'PLAYING') {
      PlayerAction.pause();
    } else {
      var trackNum = PlayerStore.getTrackNum();
      if (trackNum < 0) {
        trackNum = 0;
      }
      PlayerAction.play(trackNum);
    }
  },

  getDuration: function(){
    var duration = this.state.duration || 0.0;
    var m = Math.floor(duration / 60);
    var s = Math.floor(duration % 60);
    return sprintf('%02d:%02d', m, s);
  },

  getCurrentTime: function(){
    var currentTime = this.state.currentTime || 0.0;
    var m = Math.floor(currentTime / 60);
    var s = Math.floor(currentTime % 60);
    return sprintf('%02d:%02d', m, s);
  },

  getCurrentPosition: function(){
    var max = 225;
    var duration = this.state.duration || 0.0;
    var currentTime = this.state.currentTime || 0.0;

    return 225 * ( currentTime / duration );
  },

  progressInit: function(){
    this.clearTimer();

    this.progressStart();
  },

  progressStart: function(){
    var currentTime = PlayerStore.getCurrentTime();
    var duration = PlayerStore.getDuration();
    if (currentTime >= duration) {
      this.clearTimer();
      return;
    }
    this.timer = setTimeout(this.progressStart, 1000);
    PlayerAction.updateCurrentTime(this.state.currentTime + 1);
  },

  clearTimer: function(){
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  },

  onChange: function(state){
    if (state === 'TRACK_CHANGE' || (state === 'PLAY' && this.timer === null)) {
      this.progressInit();
    }
    else if (state === 'PAUSED') {
      this.clearTimer();
    }

    this.setState(this.getState());
  },

  getState: function(){
    return {
      playerState: PlayerStore.getPlayerState(),
      title: PlayerStore.getTitle(),
      currentTime: PlayerStore.getCurrentTime(),
      duration: PlayerStore.getDuration()
    };
  }
});

module.exports = Player;
