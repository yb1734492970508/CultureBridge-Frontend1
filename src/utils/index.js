export const createPageUrl = (pageName, params = {}) => {
  let url = "/";
  switch (pageName) {
    case "Home":
      url = "/home";
      break;
    case "Courses":
      url = "/courses";
      break;
    case "CourseDetail":
      url = "/course-detail";
      break;
    case "Rewards":
      url = "/rewards";
      break;
    case "Profile":
      url = "/profile";
      break;
    default:
      url = "/";
  }

  const queryString = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join("&");

  return queryString ? `${url}?${queryString}` : url;
};

