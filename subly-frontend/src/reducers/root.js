import { combineReducers } from 'redux';
import users from './users';
import currentUser from './currentUser';
import errors from './errors';
import token from './token';
import products from './products';
/** combines the reducers into one root reducer */
export default combineReducers({ users, currentUser, errors, token, products });
