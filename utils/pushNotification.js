import admin from 'firebase-admin';
import serviceAccount from './blackhorse-firebase-adminsdk.json';
import Notification from '../models/notificationSchema';
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const messaging = admin.messaging();

export const pushNotification = async (title, body, type, customerId, supplierId, deliveryBoyId, deviceToken) => {
    const newNotification = new Notification({
        title: title,
        body: body,
        type: type,
        customerId: customerId,
        supplierId: supplierId,
        deliveryBoyId: deliveryBoyId
    });
    await newNotification.save();

    if (typeof deviceToken === 'string') {  // push single notification
        const message = {
            android: { priority: 'high', notification: { title: title, body: body } },
            token: deviceToken,
        };
        await messaging.send(message);
    } else if (Array.isArray(deviceToken)) {  // push multiple notifications
        const messages = deviceToken.map(token => ({
            android: { priority: 'high', notification: { title: title, body: body } },
            token: token,
        }));
        await Promise.all(messages.map(message => messaging.send(message)));
    }
};
