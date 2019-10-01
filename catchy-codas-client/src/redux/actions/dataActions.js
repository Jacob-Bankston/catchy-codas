import {
  SET_TAGTEAMS,
  LOADING_DATA,
  LIKE_TAGTEAM,
  UNLIKE_TAGTEAM,
  DELETE_TAGTEAM,
  SET_ERRORS,
  POST_TAGTEAM,
  CLEAR_ERRORS,
  LOADING_UI,
  SET_TAGTEAM,
  STOP_LOADING_UI,
  SUBMIT_COMMENT
} from "../types";
import axios from "axios";

// Get all tagteams
export const getTagTeams = () => dispatch => {
  dispatch({ type: LOADING_DATA });
  axios
    .get("/tagteams")
    .then(res => {
      dispatch({
        type: SET_TAGTEAMS,
        payload: res.data
      });
    })
    .catch(err => {
      dispatch({
        type: SET_TAGTEAMS,
        payload: []
      });
    });
};
export const getTagTeam = tagteamId => dispatch => {
  dispatch({ type: LOADING_UI });
  axios
    .get(`/tagteam/${tagteamId}`)
    .then(res => {
      dispatch({
        type: SET_TAGTEAM,
        payload: res.data
      });
      dispatch({ type: STOP_LOADING_UI });
    })
    .catch(err => console.log(err));
};
// Post a tagteam
export const postTagTeam = newTagTeam => dispatch => {
  dispatch({ type: LOADING_UI });
  axios
    .post("/tagteam", newTagTeam)
    .then(res => {
      dispatch({
        type: POST_TAGTEAM,
        payload: res.data
      });
      dispatch(clearErrors());
    })
    .catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};
// Like a tagteam
export const likeTagTeam = tagteamId => dispatch => {
  axios
    .get(`/tagteam/${tagteamId}/like`)
    .then(res => {
      dispatch({
        type: LIKE_TAGTEAM,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};
// Unlike a tagteam
export const unlikeTagTeam = tagteamId => dispatch => {
  axios
    .get(`/tagteam/${tagteamId}/unlike`)
    .then(res => {
      dispatch({
        type: UNLIKE_TAGTEAM,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};
// Submit a comment
export const submitComment = (tagteamId, commentData) => dispatch => {
  axios
    .post(`/tagteam/${tagteamId}/comment`, commentData)
    .then(res => {
      dispatch({
        type: SUBMIT_COMMENT,
        payload: res.data
      });
      dispatch(clearErrors());
    })
    .catch(err => {
      dispatch({
        type: SET_ERRORS,
        payload: err.response.data
      });
    });
};
export const deleteTagTeam = tagteamId => dispatch => {
  axios
    .delete(`/tagteam/${tagteamId}`)
    .then(() => {
      dispatch({ type: DELETE_TAGTEAM, payload: tagteamId });
    })
    .catch(err => console.log(err));
};

export const getUserData = userHandle => dispatch => {
  dispatch({ type: LOADING_DATA });
  axios
    .get(`/user/${userHandle}`)
    .then(res => {
      dispatch({
        type: SET_TAGTEAMS,
        payload: res.data.tagteams
      });
    })
    .catch(() => {
      dispatch({
        type: SET_TAGTEAMS,
        payload: null
      });
    });
};

export const clearErrors = () => dispatch => {
  dispatch({ type: CLEAR_ERRORS });
};
