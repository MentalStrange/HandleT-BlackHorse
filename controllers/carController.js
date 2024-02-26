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
      res.status(200).json({ status: 'success', data: null });
    } else {
      res.status(404).json({ status: 'fail', message: 'Car not found' });
    }
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
};


export { createCar, getCars, updateCar, deleteCar };
