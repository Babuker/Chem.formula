window.chemicalDatabase = {
    apis: {
        "paracetamol": { name: "Paracetamol", standardWeight: 500, incompatibilities: ["Strong Oxidizers"], suggestedExcipients: ["MCC PH-102", "PVP K30", "Magnesium Stearate"] },
        "ibuprofen": { name: "Ibuprofen", standardWeight: 400, incompatibilities: ["Strong Bases"], suggestedExcipients: ["Lactose", "Croscarmellose", "Magnesium Stearate"] }
    },
    excipients: {
        "MCC PH-102": { function: "Filler", range: [20, 90] },
        "PVP K30": { function: "Binder", range: [2, 5] },
        "Magnesium Stearate": { function: "Lubricant", range: [0.5, 1] },
        "Croscarmellose": { function: "Disintegrant", range: [2, 5] },
        "Lactose": { function: "Filler", range: [20, 80] }
    },
    prices: { // سعر الكيلو جرام تقريباً
        "Paracetamol": 12.0, "Ibuprofen": 18.5, "MCC PH-102": 4.2, "PVP K30": 9.0, "Magnesium Stearate": 6.5, "Croscarmellose": 11.0, "Lactose": 3.8
    }
};
