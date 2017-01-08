module.exports = class TempPickup {
    constructor(donator, volunteer) {
        this.id = donator._id + volunteer._id;
        this.donator = donator;
        this.volunteer = volunteer;
    }
}