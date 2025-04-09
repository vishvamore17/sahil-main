const ServiceEngineer = require("../model/serviceEngineer.model"); // Ensure case matches your file

// Get all engineers
const getServiceEngineers = async (req, res) => {
    try {
        const engineers = await ServiceEngineer.find();
        res.json(engineers);
    } catch (error) {
        res.status(500).json({ error: "Error fetching engineers" });
    }
};

// Add new engineer
const addServiceEngineer = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Engineer name is required" });

        const newEngineer = new ServiceEngineer({ name });
        await newEngineer.save();
        res.status(201).json({ message: "Engineer added successfully", id: newEngineer._id });
    } catch (error) {
        res.status(500).json({ error: "Error adding engineer" });
    }
};

const updateServiceEngineer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false,
                error: "Invalid engineer ID format" 
            });
        }

        // Validate name
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ 
                success: false,
                error: "Valid engineer name is required" 
            });
        }

        const trimmedName = name.trim();

        // Check if engineer exists before updating
        const existingEngineer = await ServiceEngineer.findById(id);
        if (!existingEngineer) {
            return res.status(404).json({ 
                success: false,
                error: "Engineer not found" 
            });
        }

        // Update the engineer
        const updatedEngineer = await ServiceEngineer.findByIdAndUpdate(
            id, 
            { name: trimmedName }, 
            { 
                new: true,         // Return the updated document
                runValidators: true // Run schema validators on update
            }
        );

        if (!updatedEngineer) {
            return res.status(500).json({ 
                success: false,
                error: "Update failed unexpectedly" 
            });
        }

        res.status(200).json({ 
            success: true,
            message: "Engineer updated successfully",
            data: {
                id: updatedEngineer._id,
                name: updatedEngineer.name
            }
        });

    } catch (error) {
        console.error("Error updating engineer:", error);
        
        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                error: "Validation failed",
                details: error.message 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: "Internal server error",
            details: error.message 
        });
    }
};

// Delete engineer
const deleteServiceEngineer = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEngineer = await ServiceEngineer.findByIdAndDelete(id);
        if (!deletedEngineer) return res.status(404).json({ error: "Engineer not found" });

        res.json({ message: "Engineer deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error deleting engineer" });
    }
};

module.exports = {
    getServiceEngineers,
    addServiceEngineer,
    deleteServiceEngineer,
    updateServiceEngineer
};