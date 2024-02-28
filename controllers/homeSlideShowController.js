import HomeSlideShow from "../models/homeSlideShowSchema.js";
export const createHomeSlideShow = async (req, res) => {
  const homeSlideShowImages = req.body;
  console.log('homeSlideShowImages', homeSlideShowImages);
  try {
    if(homeSlideShowImages.image.length > 0) {
      const newSlideShowImages = await HomeSlideShow.create(homeSlideShowImages);
      res.status(201).json({
        status: "success",
        data: newSlideShowImages
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "No images provided"
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message
    });
  }
}

export const deleteHomeSlideShow = async (req, res, next) => {
  const homeSlideShowId = req.params.id;
  try {
    if(homeSlideShowId){
      await HomeSlideShow.deleteById(homeSlideShowId);
      res.status(204).json({
        status:"success",
        data:null,
      })
    }else{
      throw new Error("Can not find home slide show")
    }
  } catch (error) {
    res.status(500).json({status: "fail", message: error.message})
  }
}

export const getAllHomeSlideShow = async (req, res) => {
  try {
    const homeSlideShow = await HomeSlideShow.find();
    if (homeSlideShow) {
      res.status(200).json({
        status: "success",
        data: homeSlideShow
      });
    } else {
      throw new Error("Home slide show not found");
    }
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message
    });
  }
};
