"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** show story submit form on click on "submit" */

function navSubmitClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $storyForm.show();
}

$navSubmit.on("click", navSubmitClick);
/** Show login/signup on click on "login" */

/** show favorite stories when click on nav-favorite */
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  putFavoriteStoriesOnPage();
}

$navFavorites.on("click", navFavoritesClick);

/**show user's ownStories when click on nav-my-stories */
function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick", evt);
  hidePageComponents();
  putMyStoriesOnPage();
}

$navMyStories.on("click", navMyStoriesClick);

/** Show login/signup on click on "login" */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}
