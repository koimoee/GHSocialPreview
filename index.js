const API_URL = "https://api.github.com";

let usernameForSave;
let reponameForSave;

$(document).ready(() => {
  // disable the download button
  document.getElementById("download").disabled = true;

  // action on generate
  $("#generate").click(() =>
    submitData($("#url-input").val(), $("#styles").val())
  );

  // action on download
  $("#download").click(() => downloadImage());

      // Add this code to handle the checkbox state change
  $("#show-stars").change(function () {
    const isChecked = $(this).prop("checked");
    toggleStarsVisibility(isChecked);
  });
  
});

/**
 * get the data from the user and generate the photo
 *
 * @param {string} repoTokens the username and repo name
 * @param {string} theme the theme name
 * @example repoTokens: 'oneill19/social-preview-generator'; theme: 'tokyo-night'
 */
function submitData(repoTokens, theme) {
  // check if user inserted all values
  if (!repoTokens || !theme) {
    alert("Please enter url and theme");
    return;
  }

  // split the tokens to username and repo name
  const [username, reponame] = getUrlTokens(repoTokens);

  // if the user url is not valid
  if (!username || !reponame) {
    alert("Invalid url");
    return;
  }

  // save the username and reponame for image name
  usernameForSave = username.toLowerCase();
  reponameForSave = reponame.toLowerCase();

  // generate the url for fetching data
  const repoUrl = `${API_URL}/repos/${username}/${reponame}`;

  // fetch the data and generate image
  fetchData(repoUrl, theme);
}

/**
 * split the tokens
 *
 * @param {string} repoTokens the user tokens
 * @returns array of username and repo name
 * @example input: 'oneill19/social-preview-generator'; output: ['oneill19', 'social-preview-generator']
 */
function getUrlTokens(repoTokens) {
  return repoTokens.split("/");
}

/**
 * async function to get the data with GitHub API
 *
 * @param {string} repoUrl the repository API URL
 * @param {string} theme the theme selected
 */
async function fetchData(repoUrl, theme) {
  try {
    // Fetch data
    const repoData = await fetch(repoUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // Check if the request is successful
    if (!repoData.ok) {
      throw new Error("Error in fetching data");
    }

    // Parse the response to JSON
    const repoInfo = await repoData.json();

    // Fetch additional data including the primary language
    const repoLangUrl = `${API_URL}/repos/${repoInfo.owner.login}/${repoInfo.name}/languages`;
    const langData = await fetch(repoLangUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // Check if the request for language data is successful
    if (!langData.ok) {
      throw new Error("Error in fetching language data");
    }

    // Parse language data to JSON
    const langInfo = await langData.json();

    // Generate the image with repository data and language information
    generateImage(
      repoInfo.owner.login,
      repoInfo.owner.avatar_url,
      repoInfo.name,
      repoInfo.description,
      repoInfo.stargazers_count,
      theme,
      langInfo
    );
  } catch (error) {
    console.error(error);
    alert("Error in fetching data");
  }
}

/**
 * Generate the image div
 *
 * @param {string} username the repository owner username
 * @param {string} userImage the repository owner image
 * @param {string} repoName the repository name
 * @param {string} description the repository description
 * @param {string} stars the repository number of stars
 * @param {string} theme the selected theme
 * @param {object} langInfo language information
 */
function generateImage(
  username,
  userImage,
  repoName,
  description,
  stars,
  theme,
  langInfo
) {
  // create the card div
  let imgCard = createCardElement(
    username,
    userImage,
    repoName,
    description,
    stars,
    theme,
    langInfo
  );

  // empty the div that contains the card
  $("#img").empty();

  // add the card
  $("#img").append(imgCard);

  // enable the download button for the card
  document.getElementById("download").disabled = false;
}

/**
 * create the card div, styled by the theme selected
 *
 * @param {string} username the repository owner username
 * @param {string} userImage the repository owner image
 * @param {string} repoName the repository name
 * @param {string} description the repository description
 * @param {string} stars the repository number of stars
 * @param {string} theme the selected theme
 * @param {object} langInfo language information
 * @returns div of the card
 */
function createCardElement(
  username,
  userImage,
  repoName,
  description,
  stars,
  theme,
  langInfo
) {
  // create the div that contains all the data
  let elem = createElementWithClass("div", `img-card ${theme}`);

  // create the head div of the card
  let head = createCardHead(stars);

  // create the content div of the card
  let content = createCardContent(username, repoName, description, theme, langInfo);

  // create the footer div of the card
  let footer = createCardFooter(username, userImage);

  // append the head, content, and footer the parent element
  elem.append(head, content, footer);

  // return the element
  return elem;
}

/**
 * create the header of the card
 *
 * @param {string} stars the repository number of stars
 * @returns card header div
 */
function createCardHead(stars) {
  // create the div that contains the elements of the card head
  let head = createElementWithClass("div", "card-head");

  // create the MacOS style buttons div
  let buttons = createElementWithClass("div", "buttons");
  let red = createElementWithClass("div", "red");
  let yellow = createElementWithClass("div", "yellow");
  let green = createElementWithClass("div", "green");
  buttons.append(red, yellow, green);

  // create the number of stars div
  let star = createElementWithClass("div", "stars");
  let numOfStars = document.createElement("span");
  numOfStars.textContent = stars;
  let starIcon = createElementWithClass("i", "far fa-star");
  star.append(numOfStars, starIcon);

  // append the buttons and star to the parent element
  head.append(buttons, star);

  // return the head div
  return head;
}

/**
 * create the content of the card, styled by the theme selected
 *
 * @param {string} username the repository owner username
 * @param {string} repoName the repository name
 * @param {string} description the repository description
 * @param {string} theme the selected theme
 * @param {object} langInfo language information
 * @returns card content div
 */
function createCardContent(username, repoName, description, theme, langInfo) {
    // create the div that contains the elements of the card content
    let content = createElementWithClass("div", "card-content");
  
    // create the title of the content div, the username and the repository name
    let title = createElementWithClass("div", "title");
    let usernameSpan = createElementWithClass("span", `${theme}-username`);
    usernameSpan.textContent = `${username} / `;
    let repoNameSpan = createElementWithClass("span", `${theme}-reponame`);
    repoNameSpan.textContent = repoName;
    title.append(usernameSpan, repoNameSpan);
  
    // create the description div
    let descriptionDiv = createElementWithClass("div", "description");
    let descriptionSpan = createElementWithClass("span", `${theme}-description`);
    descriptionSpan.textContent = description;
    descriptionDiv.append(descriptionSpan);
  
    // create the language div
    let languageDiv = createElementWithClass("div", "language");
    let languageSpan = createElementWithClass("span", `${theme}-language`);
  
    // Check if there is language information
    if (langInfo) {
      const languages = Object.entries(langInfo);
  
      // Limit the number of displayed languages to 4
      const limitedLanguages = languages.slice(0, 4);
  
      // Calculate the total percentage
      const totalPercentage = limitedLanguages.reduce((total, [, percent]) => total + percent, 0);
  
      // Format multiple languages
      const formattedLanguages = limitedLanguages.map(([lang, percent]) => {
        const formattedPercent = ((percent / totalPercentage) * 100).toFixed(2);
        return `${lang} ${formattedPercent}%`;
      });
  
      languageSpan.textContent = `${formattedLanguages.join(' | ')}`;
    } else {
      languageSpan.textContent = "Language: Not specified";
    }
  
    languageDiv.append(languageSpan);
  
    // append the title, description, and language to the parent element
    content.append(title, descriptionDiv, languageDiv);
  
    // return the content div
    return content;
  }
  
  
  

/**
 * create the footer of the card
 *
 * @param {string} username the repository owner username
 * @param {string} userImage the repository owner image
 * @returns card footer div
 */
function createCardFooter(username, userImage) {
  // create the div that contains the elements of the card footer
  let footer = createElementWithClass("div", "card-footer");

  // create the profile image div
  let profileDiv = createElementWithClass("div", "profile-img");
  let profileImage = createElementWithClass("img", "profile");
  profileImage.src = userImage;
  profileImage.alt = username;
  profileDiv.append(profileImage);

  // append the profile image to the parent element
  footer.append(profileDiv);

  // return the footer div
  return footer;
}

/**
 * generic function to create an element with a class
 *
 * @param {string} tag the element tag
 * @param {string} tagClass the element class
 * @returns element with class
 * @example input: 'div', 'img'; output: <div class="img"></div>
 * @param {boolean} showStars True if stars should be visible, false otherwise
 */
function createElementWithClass(tag, tagClass) {
  // create the element
  let elem = document.createElement(tag);

  // add the class
  elem.className = tagClass;

  // return the element
  return elem;
}

/**
 * download the card div as a PNG image using dom-to-image and FileSave.js libraries
 */
function downloadImage() {
  // get the div of the card div
  let elem = document.getElementById("img");

  // convert to blob and download as PNG
  domtoimage.toBlob(elem).then((blob) => {
    window.saveAs(blob, `${usernameForSave}.${reponameForSave}.png`);
  });
}

function toggleStarsVisibility(showStars) {
  // Find the stars element within the generated image
  const starsElement = $(".stars");

  // Toggle visibility based on the checkbox value
  if (showStars) {
      starsElement.show();
  } else {
      starsElement.hide();
  }
}