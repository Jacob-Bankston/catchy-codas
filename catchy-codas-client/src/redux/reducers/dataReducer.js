import {
  SET_TAGTEAMS,
  LIKE_TAGTEAM,
  UNLIKE_TAGTEAM,
  LOADING_DATA,
  DELETE_TAGTEAM,
  POST_TAGTEAM,
  SET_TAGTEAM,
  SUBMIT_COMMENT
} from "../types";

const initialState = {
  tagteams: [],
  tagteam: {},
  loading: false
};

export default function(state = initialState, action) {
  switch (action.type) {
    case LOADING_DATA:
      return {
        ...state,
        loading: true
      };
    case SET_TAGTEAMS:
      return {
        ...state,
        tagteams: action.payload,
        loading: false
      };
    case SET_TAGTEAM:
      return {
        ...state,
        tagteam: action.payload
      };
    case LIKE_TAGTEAM:
    case UNLIKE_TAGTEAM:
      let index = state.tagteams.findIndex(
        tagteam => tagteam.tagteamId === action.payload.tagteamId
      );
      state.tagteams[index] = action.payload;
      if (state.tagteam.tagteamId === action.payload.tagteamId) {
        state.tagteam = action.payload;
      }
      return {
        ...state
      };
    case DELETE_TAGTEAM:
      index = state.tagteams.findIndex(
        tagteam => tagteam.tagteamId === action.payload
      );
      state.tagteams.splice(index, 1);
      return {
        ...state
      };
    case POST_TAGTEAM:
      return {
        ...state,
        tagteams: [action.payload, ...state.tagteams]
      };
    case SUBMIT_COMMENT:
      return {
        ...state,
        tagteam: {
          ...state.tagteam,
          comments: [action.payload, ...state.tagteam.comments]
        }
      };
    default:
      return state;
  }
}
