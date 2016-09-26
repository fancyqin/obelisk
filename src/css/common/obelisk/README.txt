obelisk

core
    _var.scss   // 全局基础变量
    _normalize.scss // 初始化样式
    _font.scss  // 常用字体及字体图标初始化
    _typo.scss
    ...

lib // 组件（component），结构样式较简单，独立，随意使用，无先决条件
    _button
    _input
    _select
    ...

module // 模块，结构样式较复杂，其中会包含若干 lib，（命名以 M- 打头?）
    _dialog
    _form
    _table
    _crumb
    ...

biz // 全局业务代码相关样式
    _pager
    _header
    _footer

solution
    _rich-text.scss
    ...

symbolic // 软链接，主要用于非mixin方式的一个快速样式名调用
    _symbolic.scss