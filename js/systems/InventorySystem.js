class InventorySystem {
    constructor() {
        this.items = [];
    }
    add(item) {
        this.items.push(item);
        console.log("Added to inventory:", item);
    }
    has(item) {
        return this.items.includes(item);
    }
}
const inventorySystem = new InventorySystem();
