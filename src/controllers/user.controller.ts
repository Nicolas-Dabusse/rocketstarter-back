import { Request, Response } from 'express';
import { User } from '../models';
import { CreateUserRequest, UpdateUserRequest } from '../types';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData: CreateUserRequest = req.body;
    
    const user = await User.create(userData);
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll();
    
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

export const getUserByAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    
    const user = await User.findByPk(address);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    const updateData: UpdateUserRequest = req.body;
    
    const [updatedRowsCount] = await User.update(updateData, {
      where: { address }
    });
    
    if (updatedRowsCount === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    const updatedUser = await User.findByPk(address);
    
    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { address } = req.params;
    
    const deletedRowsCount = await User.destroy({
      where: { address }
    });
    
    if (deletedRowsCount === 0) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};