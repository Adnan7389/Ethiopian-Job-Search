const Notification = require('../models/Notification');

async function testNotifications() {
    try {
        console.log('1. Creating test notification...');
        const notification = await Notification.create({
            user_id: 1,
            message: 'Test notification',
            type: 'test',
            reference_id: 1,
            link: '/test',
            metadata: JSON.stringify({ test: true })
        });
        console.log('Created notification:', notification);

        console.log('\n2. Fetching notifications for user...');
        const notifications = await Notification.findByUser(1);
        console.log('Found notifications:', notifications);

        console.log('\n3. Marking notification as read...');
        const markedAsRead = await Notification.markAsRead(1, notification.id);
        console.log('Marked as read:', markedAsRead);

        console.log('\n4. Fetching notifications again to verify read status...');
        const updatedNotifications = await Notification.findByUser(1);
        console.log('Updated notifications:', updatedNotifications);

        console.log('\n5. Deleting test notification...');
        const deleted = await Notification.delete(1, notification.id);
        console.log('Deleted notification:', deleted);

        console.log('\n6. Final verification - fetching notifications...');
        const finalNotifications = await Notification.findByUser(1);
        console.log('Final notifications:', finalNotifications);

    } catch (error) {
        console.error('Error during test:', error);
    }
}

testNotifications(); 