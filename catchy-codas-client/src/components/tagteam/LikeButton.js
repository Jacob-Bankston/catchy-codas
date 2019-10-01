import React, { Component } from "react";
import MyButton from "../../util/MyButton";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
// Icons
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
// REdux
import { connect } from "react-redux";
import { likeTagTeam, unlikeTagTeam } from "../../redux/actions/dataActions";

export class LikeButton extends Component {
  likedTagTeam = () => {
    if (
      this.props.user.likes &&
      this.props.user.likes.find(
        like => like.tagteamId === this.props.tagteamId
      )
    )
      return true;
    else return false;
  };
  likeTagTeam = () => {
    this.props.likeTagTeam(this.props.tagteamId);
  };
  unlikeTagTeam = () => {
    this.props.unlikeTagTeam(this.props.tagteamId);
  };
  render() {
    const { authenticated } = this.props.user;
    const likeButton = !authenticated ? (
      <Link to="/login">
        <MyButton tip="Like">
          <FavoriteBorder color="primary" />
        </MyButton>
      </Link>
    ) : this.likedTagTeam() ? (
      <MyButton tip="Undo like" onClick={this.unlikeTagTeam}>
        <FavoriteIcon color="primary" />
      </MyButton>
    ) : (
      <MyButton tip="Like" onClick={this.likeTagTeam}>
        <FavoriteBorder color="primary" />
      </MyButton>
    );
    return likeButton;
  }
}

LikeButton.propTypes = {
  user: PropTypes.object.isRequired,
  tagteamId: PropTypes.string.isRequired,
  likeTagTeam: PropTypes.func.isRequired,
  unlikeTagTeam: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

const mapActionsToProps = {
  likeTagTeam,
  unlikeTagTeam
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(LikeButton);
