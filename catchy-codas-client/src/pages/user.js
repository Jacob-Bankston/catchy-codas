import React, { Component } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import TagTeam from "../components/tagteam/TagTeam";
import StaticProfile from "../components/profile/StaticProfile";
import Grid from "@material-ui/core/Grid";

import TagTeamSkeleton from "../util/TagTeamSkeleton";
import ProfileSkeleton from "../util/ProfileSkeleton";

import { connect } from "react-redux";
import { getUserData } from "../redux/actions/dataActions";

class user extends Component {
  state = {
    profile: null,
    tagteamIdParam: null
  };
  componentDidMount() {
    const handle = this.props.match.params.handle;
    const tagteamId = this.props.match.params.tagteamId;

    if (tagteamId) this.setState({ tagteamIdParam: tagteamId });

    this.props.getUserData(handle);
    axios
      .get(`/user/${handle}`)
      .then(res => {
        this.setState({
          profile: res.data.user
        });
      })
      .catch(err => console.log(err));
  }
  render() {
    const { tagteams, loading } = this.props.data;
    const { tagteamIdParam } = this.state;

    const tagteamsMarkup = loading ? (
      <TagTeamSkeleton />
    ) : tagteams === null ? (
      <p>No tagteams from this user</p>
    ) : !tagteamIdParam ? (
      tagteams.map(tagteam => (
        <TagTeam key={tagteam.tagteamId} tagteam={tagteam} />
      ))
    ) : (
      tagteams.map(tagteam => {
        if (tagteam.tagteamId !== tagteamIdParam)
          return <TagTeam key={tagteam.tagteamId} tagteam={tagteam} />;
        else
          return (
            <TagTeam key={tagteam.tagteamId} tagteam={tagteam} openDialog />
          );
      })
    );

    return (
      <Grid container spacing={16}>
        <Grid item sm={8} xs={12}>
          {tagteamsMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          {this.state.profile === null ? (
            <ProfileSkeleton />
          ) : (
            <StaticProfile profile={this.state.profile} />
          )}
        </Grid>
      </Grid>
    );
  }
}

user.propTypes = {
  getUserData: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  data: state.data
});

export default connect(
  mapStateToProps,
  { getUserData }
)(user);
