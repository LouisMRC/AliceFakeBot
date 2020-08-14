module.exports = class Page
{
    constructor(pageSize)
    {
        this.pageSize = pageSize;
        this.pages = [];
        this.pages.push(new Array());
    }
    push(item)
    {
        if(this.full(this.latestIndex))this.pages.push(new Array());
        this.pages[this.latestIndex].push(item);
    }
    getPage(pageIndex)
    {
        return this.pages[pageIndex];
    }
    get latest()
    {
        return this.pages[this.pages.length-1];
    }
    get latestIndex()
    {
        return this.pages.length-1;
    }
    full(index)
    {
        return this.pages[index].length >= this.pageSize;
    }
    get length()
    {
        return this.pages.length
    }
}
