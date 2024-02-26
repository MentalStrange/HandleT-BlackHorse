 // Import the Car model

import { transformationCar } from "../format/transformationObject.js";
import Car from "../models/carSchema.js";

// Create a new car
const createCar = async (req,res) => {
  const carData = req.body;
  console.log('carData', carData);
  try {
    const newCar = new Car(carData);
    const savedCar = await newCar.save();
    res.status(201).json({ status: 'success', data: transformationCar(savedCar)});
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};
// Read cars
const getCars = async () => {
  try {
    const cars = await Car.find();
    return { status: 'success', data: cars };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};
// Update a car
const updateCar = async (carId, updateData) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(carId, updateData, { new: true });
    if (!updatedCar) {
      return { status: 'fail', message: 'Car not found' };
    }
    return { status: 'success', data: updatedCar };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

// Delete a car
const deleteCar = async (carId) => {
  try {
    const deletedCar = await Car.findByIdAndDelete(carId);
    if (!deletedCar) {
      return { status: 'fail', message: 'Car not found' };
    }
    return { status: 'success', message: 'Car deleted successfully' };
  } catch (error) {
    return { status: 'fail', message: error.message };
  }
};

export { createCar, getCars, updateCar, deleteCar };
