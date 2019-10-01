import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";

import TagTeam from "../components/tagteam/TagTeam";
import Profile from "../components/profile/Profile";
import TagTeamSkeleton from "../util/TagTeamSkeleton";

import { connect } from "react-redux";
import { getTagTeams } from "../redux/actions/dataActions";

class home extends Component {
  componentDidMount() {
    this.props.getTagTeams();
  }
  render() {
    const { tagteams, loading } = this.props.data;
    let recentTagTeamsMarkup = !loading ? (
      tagteams.map(tagteam => (
        <TagTeam key={tagteam.tagteamId} tagteam={tagteam} />
      ))
    ) : (
      <TagTeamSkeleton />
    );
    return (
      <Grid container spacing={16}>
        <Grid item sm={8} xs={12}>
          {recentTagTeamsMarkup}
        </Grid>
        <Grid item sm={4} xs={12}>
          <Profile />
        </Grid>
      </Grid>
    );
  }
}

home.propTypes = {
  getTagTeams: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  data: state.data
});

export default connect(
  mapStateToProps,
  { getTagTeams }
)(home);
