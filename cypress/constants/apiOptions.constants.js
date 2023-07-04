export const orderApiOptions = {
    INITIALIZED: 'initialized',
    ACCEPTED: 'accepted',
    PICKUP_ASSIGNED: 'pickup_assigned',
    PICKEDUP: 'pickedup',
    SERVICING: 'servicing',
    READY: 'ready',
    DELIVERY_ASSIGNED: 'delivery_assigned',
    DROPPING: 'dropping',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled',
    PICKING: 'picking',
    PROCESSING: 'processing',
    DECLINED: 'declined',
    PICKUP: 'pickup',
};

export const orderTabs = {
    READY: [orderApiOptions.INITIALIZED, orderApiOptions.ACCEPTED],
    PICKING: [orderApiOptions.PICKUP_ASSIGNED, orderApiOptions.PICKEDUP],
    PROCESSING: [orderApiOptions.SERVICING, orderApiOptions.READY],
    DROPPING: [orderApiOptions.DELIVERY_ASSIGNED, orderApiOptions.DROPPING],
    COMPLETED: [orderApiOptions.COMPLETED],
    DECLINED: [orderApiOptions.REJECTED, orderApiOptions.CANCELLED]
};

export const pageOptions = {
    PAGE: 1,
    LIMIT: 300,
};