export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day:   'numeric',
        month: 'long',
        year:  'numeric',
    });
};