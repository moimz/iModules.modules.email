<?php
/**
 * 이 파일은 이메일 모듈의 일부입니다. (https://www.coursemos.co.kr)
 *
 * 이메일 발송 내역을 가져온다.
 *
 * @file /modules/email/processes/messages.get.php
 * @author ju318 <ju318@naddle.net>
 * @license MIT License
 * @modified 2024. 10. 18.
 *
 * @var \modules\email\Email $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('messages') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$sorters = Request::getJson('sorters');
$start = Request::getInt('start') ?? 0;
$limit = Request::getInt('limit') ?? 50;
$filters = Request::getJson('filters');
$keyword = Request::get('keyword');
$results->keyword = $keyword;

$records = $me
    ->db()
    ->select(['message_id'])
    ->from($me->table('messages'));

if ($filters !== null) {
    $records->setFilters($filters, 'AND', [
        'status' => 'status',
        'sended_at' => 'sended_at',
        'checked_at' => 'checked_at',
    ]);
}

if ($keyword !== null) {
    $records->where('(name like ? or email like ?)', ['%' . $keyword . '%', '%' . $keyword . '%']);
}

$message_id = request::get('message_id');
if ($message_id !== null) {
    $masasage = $records
        ->copy()
        ->addSelect(array_keys(get_object_vars($sorters)))
        ->where('message_id', $message_id)
        ->getone();
    if ($masasage === null) {
        $results->success = true;
        $results->page = -1;
        return;
    } else {
        foreach ($sorters as $field => $direction) {
            $records->addSelect([$field]);
            $records->where($field, $masasage->{$field}, $direction == 'ASC' ? '<=' : '>=');
        }
        $results->success = true;
        $results->page = $limit !== null ? ceil($records->count() / $limit) : 1;
        return;
    }
}

if ($sorters !== null) {
    foreach ($sorters as $field => $direction) {
        $records->orderBy($field, $direction);
    }
    if (isset($sorters->title) == false) {
        $records->orderBy('title', 'ASC');
    }
}

$total = $records->copy()->count();
$records = $records->limit($start, $limit)->get('message_id');

if ($records === null) {
    $results->success = true;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

foreach ($records as &$record) {
    $record = $me->getMessage($record)->getJson();
}

$results->success = true;
$results->records = $records;
$results->total = $total;
