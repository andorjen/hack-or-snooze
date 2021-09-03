"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
           <i class="far fa-star"> </i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** function is evoked upon form submit, gets data from $storyForm
 * call addStory method in models.js, and put story on page.
 */
async function handleStoryFormSubmit(evt) {
  evt.preventDefault();

  let storyInput = {
    title: $("#story-title").val(),
    author: $("#story-author").val(),
    url: $("#story-url").val()
  }
  const newStory = await storyList.addStory(currentUser, storyInput); // generate markup and prepend;
  console.log("newStory", newStory)

  const newStoryMarkup = generateStoryMarkup(newStory);
  console.log(typeof newStoryMarkup)
  // console.log(newStoryMarkup.html())

  $allStoriesList.prepend(newStoryMarkup);
  $allStoriesList.show();

  // console.log(newStory);

  $storyForm.hide();
}

$storyForm.on("submit", handleStoryFormSubmit)

/**
 * add event listener to storylist, filter for clicks on .star, evoke handleFavorireClick function
 */
$allStoriesList.on("click", ".fa-star", handleFavoriteClick)

function handleFavoriteClick(evt) {

  const storyId = $(evt.target).closest("li").attr("id");
  let story = getStoryById(storyId);
  // let story = storyList.getStory(storyId);

}

function getStoryById(id) {
  for (let story of storyList.stories) {
    if (story.id === id) {
      return story;
    }
  }
}