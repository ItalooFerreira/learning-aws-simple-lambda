function validate(customer) {
    const { name, email, active, phone } = customer;
    const result = { messages: [], success: true };
    if (name === undefined || email === undefined || active === undefined || phone === undefined) {
        result.success = false;
        result.messages.push("customer object incomplete. Required fields are: 'name', 'email', 'active', 'phone'.")
    }
    validateType([name, email, active, phone], ['string', 'string', 'boolean', 'string'], result);
    return result;
}

function validateType(attributes, types, result) {
    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        const type = types[i];
        if (typeof attribute !== type) {
            result.success = false;
            result.messages.push(`'${attribute}' value must be ${type}`);
        }
    }
}

module.exports = { validate }
