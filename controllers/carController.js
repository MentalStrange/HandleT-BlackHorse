 // Import the Car model

import { transformationCar } from "../format/transformationObject.js";
import Car from "../models/carSchema.js";
import fs from "fs";

// Create a new car
const createCar = async (req, res) => {
  const carData = req.body;
  try {
    const newCar = new Car({
      type: carData.type,
      maxWeight: carData.maxWeight,
      image: `${process.env.SERVER_URL}${req.file.path.replace(/\\/g, '/').replace(/^upload\//, '')}`,
      number: carData.number,
    });
    await newCar.save();
    res.status(201).json({ status: 'success', data: transformationCar(newCar) });
  } catch (error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      res.status(400).json({
        status: 'fail',
        message: 'Car number already exists. Please choose a unique number.',
      });
    } else {
      res.status(500).json({ status: 'fail', message: error.message });
    }
  }
};
// Read cars
const getCars = async (req,res) => {
  try {
    const cars = await Car.find();
    const allCars = cars.map((car) => transformationCar(car));
    res.status(200).json({ status: 'success', data: allCars });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message }) 
  }
};
// Update a car
const updateCar = async (req,res) => {
  const carId = req.params.id;
  const carData = req.body;
  try {
    const updatedCar = await Car.findByIdAndUpdate(carId, carData, { new: true });
    if (updatedCar) {
      res.status(200).json({ status: 'success', data: transformationCar(updatedCar) });
    } else {
      res.status(404).json({ status: 'fail', message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};
// Delete a car
const deleteCar = async (req,res) => {
  const carId = req.params.id;
  try {
    const deletedCar = await Car.findByIdAndDelete(carId);
    if (deletedCar) {
      const pathName = deletedCar.image.split('/').slice(3).join('/');
      fs.unlink('upload/' + pathName, (err) => {});
      res.status(200).json({ status: 'success', data: null });
    } else {
      res.status(404).json({ status: 'fail', message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};

const getCarByWeight = async (req,res) => {
  const orderWeight = req.body.orderWeight;
  try{
    const car = await Car.aggregate([
      {
        $addFields: {
          absoluteDifference: { $abs: { $subtract: ['$maxWeight', orderWeight] } } // Calculate absolute difference
        }
      },
      {
        $match: {
          $or: [
            { maxWeight: orderWeight }, // Include exact match case
            { maxWeight: { $gt: orderWeight } } // Also include cases where maxWeight is greater than orderWeight
          ]
        }
      },
      {
        $sort: { absoluteDifference: 1 } // Sort by absolute difference
      },
      { $limit: 1 } // Limit to the closest car
    ]);
    if(!car){
      res.status(207).json({ status: 'fail', message: 'Car not found' });
    }
    res.status(200).json({ status: 'success', data: transformationCar(car[0]) });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
}

const changeImageCar = async (req, res) => {
  const carId = req.params.id;
  try {
    const car = await Car.findById(carId);
    const pathName = car.image.split('/').slice(3).join('/');
    fs.unlink('upload/' + pathName, (err) => {});
    car.image = `${process.env.SERVER_URL}${req.file.path.replace(/\\/g, '/').replace(/^upload\//, '')}`
    await car.save();
    res.status(200).json({
      status:"success",
      data: transformationCar(car)
    })
   } catch (error) {
    res.status(500).json({
      status:'fail',
      message:error.message,
    })
  }
}

export { createCar, getCars, updateCar, deleteCar, getCarByWeight, changeImageCar };
