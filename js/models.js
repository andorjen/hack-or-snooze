"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    const url = new URL(this.url)
    return url.hostname;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, newStory) {
    //  write newStory info and user info into databse, returns a storyData object
    const storyData = await axios({
      url: `${BASE_URL}/stories`,
      method: "POST",
      data: {
        token: user.loginToken,
        story: {
          author: newStory.author,
          title: newStory.title,
          url: newStory.url
        }
      }
    });
    // console.log(storyData);
    // get storyId, title, author, url, username, createdAt from storyData, create and return newStory
    // const storyId = storyData.data.story.storyId;
    // const title = storyData.data.story.title;
    // const author = storyData.data.story.author;
    // const url = storyData.data.story.url;
    // const username = storyData.data.story.username;
    // const createdAt = storyData.data.story.createdAt;

    //!!!! update stories in srorylist and myown stories in User

    const story = new Story(storyData.data.story);
    this.stories.unshift(story);
    user.ownStories.unshift(story);
    return story;
  }

  // async getStory(storyId) {
  //   let storyData = await axios.get(`${BASE_URL}/stories/${storyId}`);
  //   console.log("storyData", storyData, "storyData.data.story", storyData.data.story)

  //   let story = new Story(storyData.data.story);
  //   return story;
  // }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }
  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  /**
   * Add story to beginning of the favorites list and update database.
   */
  async addFavorite(story) {
    await axios.post(`${BASE_URL}/users/${this.username}/favorites/${story.storyId}`, { token: this.loginToken });
    this.favorites.unshift(story);
  }
  /**
   * Remove story from favorites list and update database.
   */
  async removeFavorite(story) {
    await axios({
      url: `${BASE_URL}/users//${this.username}/favorites/${story.storyId}`,
      method: "DELETE",
      data: { token: this.loginToken },
    });
    // console.log(story.storyId);
    this.favorites = this.favorites.filter((storyInfo) => {
      return storyInfo.storyId !== story.storyId;
    })
  }

  /** loop throug all user's favorites, and change the star to be solid on favorites */
  addUserFavoritesUI() {
    for (let story of this.favorites) {
      let storyId = `#${story.storyId}`;
      $(storyId).find(".fa-star").removeClass("far").addClass("fas");
    }
  }

  /**loop through all of my stories, if exist in favorites, change star to be solid */
  addMyStoriesUI() {
    const favoriteIds = [];
    for (let favoriteStory of this.favorites) {
      favoriteIds.push(favoriteStory.storyId);
    }
    for (let story of this.ownStories) {
      let storyId = `#${story.storyId}`;
      if (favoriteIds.includes(story.storyId)) {
        $(storyId).find(".fa-star").removeClass("far").addClass("fas");
      }
    }
  }
}

// TODO: move UI uodate functions to genreateMarkup functions