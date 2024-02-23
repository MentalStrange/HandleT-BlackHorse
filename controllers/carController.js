import Car from './carSchema.js'; // Import the Car model

// Create a new car
const createCar = async (carData) => {
  try {
    const newCar = new Car(carData);
    const savedCar = await newCar.save();
    return { status: 'success', data: savedCar };
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
