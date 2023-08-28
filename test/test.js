import axios from "axios";

const test = () => {
  console.log("test");
};

const warpper = () => {
  test();
  let options = {};
  axios(options)
    .then((rep) => rep)
    .catch((e) => {
      console.log(e);
    });
  return -1;
};

export default warpper;
